import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CURRENCY } from 'src/common/types/ecommerce.enum';

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({ required: true, unique: true, trim: true })
  sku: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, enum: CURRENCY, default: CURRENCY.USD })
  currency: CURRENCY;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ default: null })
  thumbnail?: string | null;

  @Prop({ type: [Number], default: [] })
  embedding: number[];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
