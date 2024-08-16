const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;
let db;

const connectToDb = async (dbName) => {
    try {
        client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

const getDb = (dbName=process.env.DB_NAME) => {
    if (!client) {
        throw new Error('Client not initialized. Call connectToDb first.');
    }
    return client.db(dbName);
};

const closeDbConnection = () => {
    if (client) {
        client.close();
    }
};

module.exports = {
    connectToDb,
    getDb,
    closeDbConnection
};
