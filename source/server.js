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

/**
 * Inserts a new task into the database
 * 
 * @param {Function} callback 
 */
const insertTask = (title, due_date, callback) => {
    const query = 'INSERT INTO Tasks (title, due_date) VALUES (?, ?)';
    connection.query(query, [title, due_date], (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

/**
 * Inserts a new visit into the database
 * 
 * @param {Function} callback 
 */
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

/**
 * Gets number of tasks that are completed from backend
 * 
 * @param {Function} callback 
 */
const fetchNumberCompleted = (callback) => {

    const sqlQuery = `
        SELECT CASE
                WHEN COUNT(*) > 0 THEN (SELECT SUM(completed) FROM Tasks) 
                ELSE 0
            END AS CompletedCount
        FROM Tasks
    `

    connection.query(sqlQuery, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    })
}

// Create an HTTP server
export const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parse the URL
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (req.url === '/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { title, due_date } = JSON.parse(body);
            insertTask(title, due_date, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Task added successfully' }));
                }
            });
        });
    } else if (req.url === '/streaks' && req.method === 'POST') {
        addStreaks((err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Streak added/updated successfully' }));
            }
        });
    } else if (req.url === '/tasks' && req.method === 'GET') {
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
    } else if (req.url === '/num-completed' && req.method === 'GET') {
        // fetches number of completed tasks
        fetchNumberCompleted((err, numCompleted) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(numCompleted));
            }
        });
    } else if (req.url === '/' && req.method === 'GET') {
        console.log('Home page accessed');
        addStreaks((err, results) => {
            if (err) {
                console.error('Error adding streak:', err);
            }
            console.log('Added streak:', results);
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>Internal Server Error</h1>');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        });
    // Update the condition for serving CSS files
    } else if (req.url.endsWith('.css') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/css');
    // Update the condition for serving JavaScript files
    } else if (req.url.endsWith('.js') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/javascript');
    } else if (req.url.endsWith('.html') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/html');

    // Add conditions for serving image files
    } else if (req.url.match(/\.(jpg|jpeg|png|gif|svg)$/) && req.method === 'GET') {
        const ext = path.extname(req.url).slice(1);
        const contentType = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        serveStaticFile(res, req.url.slice(1), contentType);


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