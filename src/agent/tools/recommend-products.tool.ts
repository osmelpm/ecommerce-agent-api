import {
  RecommendProductsInput,
  RecommendProductsInputSchema,
} from 'src/products/dto';
import { tool } from '@langchain/core/tools';
import { ProductsService } from 'src/products/products.service';

export function makeRecommendProductsTool(productsService: ProductsService) {
  return tool(
    async (input: RecommendProductsInput) => {
      const { query, limit = 6, filters } = input;

      const results = await productsService.recommend({
        query,
        limit,
        filters,
      });

      if (!results || results.length === 0) {
        return { items: [] };
      }

      return {
        items: results.map((p: any) => ({
          sku: p.sku,
          title: p.title,
          price: p.price,
          currency: p.currency ?? 'USD',
          url: p.url,
          thumbnail: p.thumbnail ?? null,
          categories: p.categories ?? [],
          inStock: p.inStock,
        })),
      };
    },
    {
      name: 'recommend_products',
      description:
        'Recommend products from the catalog using a semantic query and optional filters (price, category, stock).',
      schema: RecommendProductsInputSchema,
    },
  );
}
