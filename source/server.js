import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'
import fs from 'fs'
// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pw',
    database: 'prod',
    port: 3307
});

const addStreaks = (callback) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to the start of the day
    const formattedDate = today.toISOString().split('T')[0];  // Format date as YYYY-MM-DD

    // First, check if there's already a visit for today
    const checkQuery = 'SELECT * FROM SiteVisits WHERE visit_date = ?';
    connection.query(checkQuery, [formattedDate], (checkError, checkResults) => {
        if (checkError) {
            callback(checkError);
        } else if (checkResults.length > 0) {
            // If a record for today exists, do nothing (or handle as needed)
            callback(null, { message: 'Visit already recorded for today' });
        } else {
            // If no record for today exists, insert a new record
            const insertQuery = 'INSERT INTO SiteVisits (visit_date) VALUES (?)';
            connection.query(insertQuery, [formattedDate], (insertError, insertResults) => {
                if (insertError) {
                    callback(insertError);
                } else {
                    callback(null, insertResults);
                }
            });
        }
    });
};


const fetchTasks = (callback) => {
    connection.query('SELECT * FROM Tasks', (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};


// Create an HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/tasks' && req.method === 'GET') {
        fetchTasks((err, users) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            }
        });

    } else if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Internal Server Error</h1>');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    // Update the condition for serving CSS files
    } else if (req.url.endsWith('.css') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/css');


    // Update the condition for serving JavaScript files
    } else if (req.url.endsWith('.js') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/javascript');
    } else if (req.url.endsWith('.html') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/html');

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const serveStaticFile = (res, filename, contentType) => {
    const filePath = path.join(__dirname, filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
};

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});