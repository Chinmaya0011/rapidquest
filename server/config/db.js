const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function connectToDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
}

async function fetchCollectionData(collectionName) {
  const client = await connectToDatabase();
  try {
    const database = client.db('RQ_Analytics');
    const collection = database.collection(collectionName);
    const data = await collection.find().limit(25).toArray(); // Fetch a sample of 5 documents
    return data;
  } finally {
    await client.close();
  }
}

module.exports = { fetchCollectionData };
