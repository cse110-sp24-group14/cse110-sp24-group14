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

/**
 * Fetch all the tasks of for a specified date
 * 
 * @param {string} date - date of tasks to fetch
 * @param {Function} callback - handles the outcome of the fetch
 */
const fetchTasks = (date, callback) => {
    // const date = new Date().toISOString().slice(0, 10);
    console.log(date)
    const query = `SELECT * FROM Tasks WHERE due_date = '${date}'`
    console.log(query)
    connection.query(query, (error, results) => {
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
 * @param {Function} callback - handles the outcome of the fetch
 */
const fetchNumberCompleted = (date, callback) => {

    const sqlQuery = `
        SELECT CASE
                WHEN COUNT(*) > 0 THEN SUM(completed) 
                ELSE 0
            END AS CompletedCount
        FROM Tasks
        WHERE due_date = '${date}'
    `

    connection.query(sqlQuery, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    })
}

/**
 * Updates the completion of a task specified by its id
 * 
 * @param {number} taskId id of the task to be updated
 * @param {boolean} completed state to change the task's completion to
 * @param {Function} callback - handles the outcome of the fetch
 */
const updateTaskCompletion = (taskId, completed, callback) => {
    const sqlQuery = `
        UPDATE Tasks
        SET completed = ${completed}
        WHERE id = ${taskId}
    `;

    connection.query(sqlQuery, (error, result) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, result);
        }
    })
}

/**
 * Deletes a task specified by its id from the SQL database 
 * 
 * @param {number} taskId - the id of the task to delete
 * @param {Function} callback - handles the outcome of the fetch
 */
const deleteTask = (taskId, callback) => {
    const sqlQuery = `
        DELETE FROM Tasks
        WHERE id = ${taskId}
    `

    connection.query(sqlQuery, (error, result) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, result);
        }
    })
}

/**
 * Starts the server with all the routes
 */
export const server = http.createServer((req, res) => {

    // console.log("Running")
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.searchParams;
    if (pathname === '/tasks' && req.method === 'GET') {
        console.log("inside")
        const date = query.get('date');
        fetchTasks(date, (err, users) => {
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
        const date = query.get('date');
        fetchNumberCompleted(date, (err, numCompleted) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(numCompleted));
            }
        });
    } else if (pathname === '/updated-task-completion' && req.method === 'PUT') {
        // updates the completed state of task
        const taskId = query.get('taskId');
        const completed = query.get('completed');
        updateTaskCompletion(taskId, completed, (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            }
        })
    } else if (pathname === '/delete-task' && req.method === 'DELETE') {
        // deletes a task
        const taskId = query.get('taskId');
        deleteTask(taskId, (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            }
        })
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
    } else if (req.url.endsWith('.json') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/json');
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
    connection.query('SELECT * FROM Snippets ORDER BY created_date DESC', (error, results) => {
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