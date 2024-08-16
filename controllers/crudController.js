const { getDb } = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse');

const handleUpload = (req, res) => {
    const chunks = [];

    req.on('data', chunk => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const boundary = `--${req.headers['content-type'].split('boundary=')[1]}`;
        const parts = buffer.toString().split(boundary).filter(part => part.includes('filename'));

        for (const part of parts) {
            const start = part.indexOf('\r\n\r\n') + 4;
            const end = part.lastIndexOf('\r\n');
            const content = part.slice(start, end).trim();

            // Handle the uploaded CSV file content
            const csvContent = Buffer.from(content, 'binary').toString('utf8');

            // Parse CSV content
            parse(csvContent, { columns: true }, async (err, records) => {
                if (err) {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error processing CSV');
                    return;
                } 

                try {

                    const db = getDb();
                    const collection = db.collection(process.env.DB_COLLECTION);

                    // Delete existing data
                    await collection.deleteMany({});

                    // Insert new data
                    await collection.insertMany(records);

                    // <<<For live debug 
                    // console.log('CSV data replaced in MongoDB:', records);
                    
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('CSV uploaded, and MongoDB data replaced');
                } catch (mongoErr) {
                    console.error(mongoErr);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error interacting with MongoDB');
                }
            });
        }
    });
};

const fetchProducts = async (req, res) => {
    const collection = process.env.DB_COLLECTION;
    let { page = 1, limit = 10, categoryFilter = null, styleFilter = null, diamondTypeFilter = null, startDate, endDate, dateKey, searchOr = null, sortKey = null, sortType = null, customLookup = null } = req.query;

    // Parse page and limit as integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Initialize query object
    let query = {};

    // Add category filter if provided
    if (categoryFilter) {
        if (categoryFilter.toLowerCase() === "unisex") {
            query.prodmeta_section = { $in: ["Mens", "Womens"] };
        } else {
            query.prodmeta_section = categoryFilter;
        }
    }

    if (styleFilter) {
        const styleArray = decodeURIComponent(styleFilter).split(',').map(style => style.trim());
        if (!styleArray.includes("All")) {
            query.style = {
                $regex: new RegExp(styleArray.join('|'), 'i')
            };
        }
    }

    if (diamondTypeFilter) {
        const styleArray = decodeURIComponent(diamondTypeFilter).split(',').map(style => style.trim());
        if (!styleArray.includes("All")) {
            query.style = {
                $regex: new RegExp(styleArray.join('|'), 'i')
            };
        }
    }

    let lookupPipeline = [];

    try {
        const db = getDb();
        const coll = db.collection(collection);

        const aggregationPipeline = [
            { $match: query }
        ];

        let sort = {};
        if (sortKey && sortType) {
            sort[sortKey] = parseInt(sortType); 
            aggregationPipeline.push({ $sort: sort });
        }

        aggregationPipeline.push(
            // { $project: { }
            // },
            ...lookupPipeline,
            { $facet: {
                paginatedResults: [
                    ...(limit !== -1 ? [{ $skip: (page - 1) * limit }, { $limit: limit }] : [])
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }}
        );

        const [result] = await coll.aggregate(aggregationPipeline).toArray();

        const total = result.totalCount.length > 0 ? result.totalCount[0].count : 0;
        const documents = result.paginatedResults;

        res.status(200).json({
            total,
            page,
            limit,
            data: documents
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    handleUpload,
    fetchProducts
};
