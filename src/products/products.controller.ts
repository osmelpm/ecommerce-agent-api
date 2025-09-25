import { ProductsService } from './products.service';
import { ZodValidationPipe } from 'src/common/pipes';
import { Body, Controller, Inject, Post, UsePipes } from '@nestjs/common';
import { RecommendProductsInput, RecommendProductsInputSchema } from './dto';

@Controller('products')
export class ProductsController {
  constructor(@Inject() private readonly productService: ProductsService) {}

  @Post('seed')
  async seedProducts() {
    return this.productService.seedProducts();
  }

  @UsePipes(new ZodValidationPipe(RecommendProductsInputSchema))
  @Post('recommendations')
  async recommendProducts(@Body() body: RecommendProductsInput) {
    return this.productService.recommend(body);
  }
}
