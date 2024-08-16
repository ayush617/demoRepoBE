const app = require('./app');
const { connectToDb, closeDbConnection } = require('./models/db');

const PORT = 4000;

// Connect to MongoDB when the server starts
(async () => {
    await connectToDb();
    app.listen(PORT, () => {
        console.log(`Server ready on port ${PORT}`);
    });
})();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing MongoDB connection');
    closeDbConnection();
    process.exit();
});
