const { getDb } = require('../models/db');

const authMiddleware = async (req, res, next) => {
    const authToken = req.headers['authorization'];
    
    if (!authToken) {
        return res.status(401).send('Unauthorized: No token provided');
    }

    try {
        const db = getDb();
        const collection = db.collection("AuthToken");
        const result = await collection.findOne({ _id: authToken });

        if (result) {
            next(); 
        } else {
            res.status(401).send('Unauthorized: Invalid token');
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = authMiddleware;
