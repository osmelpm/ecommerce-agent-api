import { MongoClient } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';

import { envs } from 'src/config';
import { loadSeed } from 'src/common/helpers';
import { RecommendProductsInput } from './dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  private readonly embeddingsModel: OpenAIEmbeddings;
  readonly vectorStore: MongoDBAtlasVectorSearch;

  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {
    this.embeddingsModel = new OpenAIEmbeddings({
      modelName: envs.EMBEDDING_MODEL,
    });

    const client = new MongoClient(envs.MONGO_URI || '');
    const collection = client
      .db(this.productModel.db.name)
      .collection(this.productModel.collection.name);

    this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddingsModel, {
      collection,
      indexName: 'vector_index',
      textKey: 'text',
      embeddingKey: 'embedding',
    });
  }

  async recommend({ query, limit }: RecommendProductsInput) {
    const recommendations = await this.vectorStore.similaritySearch(
      query,
      limit,
    );

    return recommendations.map((r) => r.metadata);
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

      const vector = await this.embeddingsModel.embedQuery(product.text);
      product.embedding = vector;

      await product.save();
    }
  }
}
