import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'
import fs from 'fs'
import url from 'url'
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


const fetchTasks = (callback) => {
    connection.query('SELECT * FROM Tasks', (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};
/**
 * Gets tasks for the current month you are at
 * 
 * @param {year, month, Function} callback 
 */
const fetchTasksDue = (year, month, callback) => {
    const sqlQuery = 'SELECT * FROM Tasks WHERE YEAR(due_date) = ? AND MONTH(due_date) = ?';
    console.log('Executing query:', sqlQuery, 'with parameters:', year, month);
    connection.execute(sqlQuery, [year, month], (error, results) => {
        if (error) {
            console.error('Error fetching tasks for month:', error);
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

// Create an HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parse the URL
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
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
    } else if (pathname === '/tasks-this-month' && req.method === 'GET') {
        const year = parseInt(query.year, 10);
        const month = parseInt(query.month, 10);
        console.log('Received request for tasks this month:', year, month);
        // Ensure year and month are valid
        if (!isNaN(year) && !isNaN(month)) {
            fetchTasksDue(year, month, (err, tasks) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tasks));
                }
            });
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad Request' }));
        }
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