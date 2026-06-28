import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import * as path from 'path';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ProductsService, CsvRowError } from './products.service';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { Product } from './schemas/product.schema';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Product> {
    return this.productsService.create(dto, new Types.ObjectId(user.userId));
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  findAll(@Query() query: FindProductsQueryDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Product> {
    return this.productsService.update(
      id,
      dto,
      new Types.ObjectId(user.userId),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (
        req: unknown,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.csv') {
          return cb(
            new BadRequestException('Only CSV files are allowed (.csv)'),
            false,
          );
        }
        const allowedMimeTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'text/plain',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file MIME type'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ): Promise<{
    inserted: number;
    updated: number;
    skipped: number;
    errors: CsvRowError[];
  }> {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.productsService.bulkImportCsv(
      file.buffer,
      new Types.ObjectId(user.userId),
    );
  }
}
