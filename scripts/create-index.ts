import { MongoClient } from 'mongodb';
import { envs } from '../src/config';

async function createIndex() {
  const client = new MongoClient(envs.MONGO_URI);
  await client.connect();

  const db = client.db(envs.DATABASE_NAME);
  const collection = db.collection('products');

  console.log('🛠 Creating vector index...');
  await collection.createSearchIndex({
    name: 'vector_index',
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

  console.log('✅ Vector index created successfully.');
  await client.close();
}

createIndex().catch((err) => {
  console.error('❌ Error creating index:', err);
  process.exit(1);
});
