import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9-]+$/, 'SKU must be uppercase alphanumeric with dashes'],
  })
  sku: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 200 })
  name: string;

  @Prop({
    required: true,
    type: Number,
    min: [0, 'Price cannot be negative'],
  })
  price: number;

  @Prop({
    required: true,
    type: Number,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer',
    },
  })
  stock: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  lastUpdatedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text' });
