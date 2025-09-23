import { Product } from '../schemas/product.schema';

export function buildEmbeddingInput(
  p: Pick<Product, 'title' | 'description' | 'categories'>,
) {
  const categories = (p.categories ?? []).join(' ');
  const parts = [
    `Title: ${p.title ?? ''}`,
    `Description: ${p.description ?? ''}`,
    categories ? `Categories: ${categories}` : '',
  ].filter(Boolean);

  return parts.join('\n');
}
