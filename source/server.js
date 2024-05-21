import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pw',
    database: 'Prod' 
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

const fetchTasks = (callback) => {
    connection.query('SELECT * FROM Tasks', (error, results) => {
        if (error) {
            console.error('Error fetching tasks:', error);
            callback(error, null);
        } else {
            console.log('Tasks fetched:', results);
            callback(null, results);
        }
    });
};

// Initialize Express app
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Endpoint to fetch tasks
app.get('/tasks', (req, res) => {
    fetchTasks((err, tasks) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(tasks);
        }
    });
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
