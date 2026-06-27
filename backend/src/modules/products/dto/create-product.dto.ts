import {
  IsString,
  IsNumber,
  IsInt,
  IsPositive,
  Matches,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'SKU must be uppercase alphanumeric (A-Z, 0-9, -)',
  })
  @MaxLength(50)
  sku: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price max 2 decimal places' })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
