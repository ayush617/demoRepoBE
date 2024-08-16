const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const authRoutes = require('./routes/authRoutes');
// const leadRoutes = require('./routes/leadsRoutes');
const crudRoutes = require('./routes/crudRoutes');
// const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Enable CORS for all requests
app.use(corsMiddleware);

app.use(express.json());

// app.use('/', emailRoutes);
app.use('/', authRoutes);
app.use('/', crudRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

module.exports = app;
