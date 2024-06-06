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
    } else if (req.url.endsWith('.json') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/json');
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