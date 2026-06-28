import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { parse } from 'csv-parse/sync';

export interface CsvRowError {
  row: number;
  sku: string;
  reason: string;
}

export interface MongooseRawResult {
  lastErrorObject?: {
    updatedExisting?: boolean;
    n?: number;
  };
  value?: ProductDocument;
  ok?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(
    dto: CreateProductDto,
    userId: Types.ObjectId,
  ): Promise<Product> {
    try {
      const product = await this.productModel.create({
        ...dto,
        lastUpdatedBy: userId,
      });
      return product;
    } catch (err) {
      const error = err as { code?: number };
      if (error.code === 11000) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
      throw err;
    }
  }

  async findAll(query: FindProductsQueryDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search } = query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('lastUpdatedBy', 'email firstName lastName')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<Product[]>()
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const product = await this.productModel
      .findById(id)
      .populate('lastUpdatedBy', 'email firstName lastName')
      .exec();

    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    userId: Types.ObjectId,
  ): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    try {
      const updated = await this.productModel
        .findByIdAndUpdate(
          id,
          { ...dto, lastUpdatedBy: userId },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      if (!updated) throw new NotFoundException(`Product ${id} not found`);
      return updated;
    } catch (err) {
      const error = err as { code?: number };
      if (error.code === 11000) {
        throw new ConflictException('SKU already exists');
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Product ${id} not found`);
  }

  async bulkImportCsv(
    buffer: Buffer,
    userId: Types.ObjectId,
  ): Promise<{
    inserted: number;
    updated: number;
    skipped: number;
    errors: CsvRowError[];
  }> {
    return this.processCsvBuffer(buffer, userId);
  }

  private async processCsvBuffer(
    buffer: Buffer,
    userId: Types.ObjectId,
  ): Promise<{
    inserted: number;
    updated: number;
    skipped: number;
    errors: CsvRowError[];
  }> {
    let records: Record<string, string>[];
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_quotes: true,
      });
    } catch {
      throw new BadRequestException(
        'CSV file is malformed and cannot be parsed',
      );
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('CSV file contains no data rows');
    }

    if (records.length > 5000) {
      throw new BadRequestException(
        'CSV file exceeds the maximum limit of 5000 rows',
      );
    }

    const requiredColumns = ['sku', 'name', 'price', 'stock'];
    const headers = Object.keys(records[0] || {});
    const missing = requiredColumns.filter((col) => !headers.includes(col));
    if (missing.length > 0) {
      throw new BadRequestException(
        `CSV missing required columns: ${missing.join(', ')}`,
      );
    }

    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as CsvRowError[],
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (!row) continue;
      const rowNum = i + 2;

      const rowError = this.validateCsvRow(row, rowNum);
      if (rowError) {
        results.errors.push(rowError);
        results.skipped++;
        continue;
      }

      const dto: CreateProductDto = {
        sku: (row['sku'] || '').trim().toUpperCase(),
        name: (row['name'] || '').trim(),
        price: parseFloat(row['price'] || '0'),
        stock: parseInt(row['stock'] || '0', 10),
      };

      try {
        const res = (await this.productModel
          .findOneAndUpdate(
            { sku: dto.sku },
            { ...dto, lastUpdatedBy: userId },
            {
              upsert: true,
              new: true,
              runValidators: true,
              setDefaultsOnInsert: true,
              rawResult: true,
            },
          )
          .exec()) as unknown as MongooseRawResult;

        const wasUpdated = res?.lastErrorObject?.updatedExisting;
        if (wasUpdated) {
          results.updated++;
        } else {
          results.inserted++;
        }
      } catch (err) {
        const error = err as Error;
        results.errors.push({
          row: rowNum,
          sku: dto.sku,
          reason: error.message || 'Database error during save',
        });
        results.skipped++;
      }
    }

    return results;
  }

  private validateCsvRow(
    row: Record<string, string>,
    rowNum: number,
  ): CsvRowError | null {
    const sku = row['sku']?.trim();
    const name = row['name']?.trim();
    const priceStr = row['price']?.trim();
    const stockStr = row['stock']?.trim();

    if (!sku || sku === '') {
      return { row: rowNum, sku: '', reason: 'SKU is required' };
    }
    if (!/^[A-Z0-9-]+$/i.test(sku)) {
      return {
        row: rowNum,
        sku,
        reason:
          'SKU must contain only uppercase alphanumeric characters and hyphens',
      };
    }
    if (!name || name.length < 2) {
      return {
        row: rowNum,
        sku,
        reason: 'Name is required and must be at least 2 characters',
      };
    }
    if (
      priceStr === undefined ||
      priceStr === null ||
      priceStr === '' ||
      isNaN(Number(priceStr)) ||
      Number(priceStr) < 0
    ) {
      return {
        row: rowNum,
        sku,
        reason: 'Price is required and must be a non-negative number',
      };
    }
    if (
      stockStr === undefined ||
      stockStr === null ||
      stockStr === '' ||
      !/^\d+$/.test(stockStr)
    ) {
      return {
        row: rowNum,
        sku,
        reason: 'Stock is required and must be a non-negative integer',
      };
    }

    return null;
  }
}
