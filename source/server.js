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
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.searchParams;
    if (pathname === '/tasks' && req.method === 'GET') {
        fetchTasks((err, users) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            }
        });
    } else if (pathname === '/num-completed' && req.method === 'GET') {
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
    } else if (pathname === '/add-snippet' && req.method === 'POST') {
        // adds a snippet entry
        const code = query.get('code');
        const language = query.get('language');
        addSnippet(code, language, (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Snippet added successfully', result }));
            }
        });
    } else if (pathname === '/fetch-snippets' && req.method === 'GET') {
        //fetches snippets
        fetchSnippets((err, snippets) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(snippets));
            }
        });
    } else if (pathname === '/' && req.method === 'GET') {
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
    } else if (pathname.endsWith('.css') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/css');


        // Update the condition for serving JavaScript files
    } else if (pathname.endsWith('.js') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/javascript');
    } else if (pathname.endsWith('.html') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/html');
        // Add conditions for serving image files
    } else if (pathname.match(/\.(jpg|jpeg|png|gif|svg)$/) && req.method === 'GET') {
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

const addSnippet = (code, language, callback) => {
    const sqlQuery = `INSERT INTO Snippets (code, code_language) VALUES ('${code}', '${language}')`;
    connection.query(sqlQuery, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

// Add a new function to fetch snippets
const fetchSnippets = (callback) => {
    connection.query('SELECT * FROM Snippets', (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

// Handle fetching snippets request
export const handleFetchSnippets = (req, res) => {
    fetchSnippets((err, snippets) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(snippets));
        }
    });
};



// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});