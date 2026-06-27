import { Module, BadRequestException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype !== 'text/csv' &&
          !file.originalname.endsWith('.csv')
        ) {
          cb(new BadRequestException('Only CSV files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
