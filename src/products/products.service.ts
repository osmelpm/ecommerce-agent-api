import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OpenAIEmbeddings } from '@langchain/openai';

import { envs } from 'src/config';
import { loadSeed } from 'src/common/utils';
import { buildEmbeddingInput } from './utils';
import { RecommendProductsInput } from './dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  private readonly embeddingsModel: OpenAIEmbeddings;

  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {
    this.embeddingsModel = new OpenAIEmbeddings({
      modelName: envs.EMBEDDING_MODEL,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.generateVectorIndex().then(() => {
      console.log('✅ Vector index created successfully.');
    });
  }

  async recommend({ query, limit, filters }: RecommendProductsInput) {
    console.log('Query:', query);
    console.log('Limit:', limit);
    console.log('Filters:', filters);
    // Mock implementation of product recommendation
    return [
      {
        sku: 'SKU123',
        title: 'Sample Product 1',
        price: 29.99,
        currency: 'USD',
        url: 'https://example.com/product1',
        thumbnail: 'https://example.com/product1.jpg',
        categories: ['Category1', 'Category2'],
        inStock: true,
      },
      {
        sku: 'SKU124',
        title: 'Sample Product 2',
        price: 49.99,
        currency: 'USD',
        url: 'https://example.com/product2',
        thumbnail: 'https://example.com/product2.jpg',
        categories: ['Category3'],
        inStock: false,
      },
    ].slice(0, limit);
  }

  async seedProducts() {
    console.log('🧹 Cleaning product collection...');
    await this.productModel.deleteMany({});

    console.log('🌱 Seeding Product collection...');
    const data = loadSeed('products.json');

    await this.productModel.insertMany(data);

    console.log('✅ Seed completed successfully.');
    await this.generateEmbeddingIngestion();

    console.log('✅ Embedding ingestion completed successfully.');

    return { message: 'Products seeded successfully' };
  }

  async generateEmbeddingIngestion() {
    const cursor = this.productModel.find({}).cursor();

    for await (const product of cursor) {
      const needs = product.embedding.length === 0;

      if (!needs) continue;

      const text = buildEmbeddingInput(product);
      const vector = await this.embeddingsModel.embedQuery(text);
      product.embedding = vector;

      await product.save();
    }
  }

  async generateVectorIndex() {
    await this.productModel.createSearchIndex({
      name: 'vsidx1',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 1536,
            similarity: 'cosine',
          },
        ],
      },
    });
  }
}
