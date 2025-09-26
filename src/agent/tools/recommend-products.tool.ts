import {
  RecommendProductsInput,
  RecommendProductsInputSchema,
} from 'src/products/dto';
import { tool } from '@langchain/core/tools';
import { ProductsService } from 'src/products/products.service';
import { ProductDocument } from 'src/products/schemas/product.schema';

export function makeRecommendProductsTool(productsService: ProductsService) {
  return tool(
    async (input: RecommendProductsInput) => {
      const { query, limit = 3 } = input;

      const retriever = productsService.vectorStore.asRetriever(limit);

      const results = await retriever.invoke(query);

      if (!results || results.length === 0) {
        return { items: [] };
      }

      const products = results.map(({ metadata }) => {
        const p = metadata as ProductDocument;
        return {
          sku: p.sku,
          title: p.title,
          description: p.description ?? '',
          price: p.price,
          currency: p.currency ?? 'USD',
          thumbnail: p.thumbnail ?? null,
          categories: p.categories ?? [],
          stock: p.stock,
        };
      });

      return { items: products };
    },
    {
      name: 'recommend_products',
      description:
        'Recommend products from the catalog using a semantic query and optional filters (price, category, stock).',
      schema: RecommendProductsInputSchema,
    },
  );
}
