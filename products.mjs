// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
// netlify/functions/products.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

exports.handler = async (event, context) => {
  try {
    await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('products');
    const products = await collection.find({}).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(products),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve products' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  }
};
