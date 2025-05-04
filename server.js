const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5500;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Разрешаем запросы с любого домена

// MongoDB connection string
const uri = "mongodb://127.0.0.1:27017"; // Замените на ваш URI, если необходимо
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Завершаем процесс при ошибке подключения
    }
}

// Вызываем функцию подключения к базе данных
connectDB();

const db = client.db('cat_products_db'); // Замените 'cat_products_db' на название вашей базы данных
const productsCollection = db.collection('products');

// API endpoints
// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Add a new product
app.post('/products', async (req, res) => {
    const newProduct = req.body;
    try {
        const result = await productsCollection.insertOne(newProduct);
        newProduct._id = result.insertedId; // Добавляем _id к новому продукту
        res.status(201).json(newProduct); // Отправляем новый продукт с _id
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// Update a product
app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;

    try {
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) }, // Используем ObjectId для поиска по _id
            { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});