import { Controller, Inject, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(@Inject() private readonly productService: ProductsService) {}

  @Post('seed')
  async seedProducts() {
    return this.productService.seedProducts();
  }
}
