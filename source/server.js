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
 * Inserts a new task into the database
 * 
 * @param {function} callback 
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
* Adds to the streak based on the site visits or new streak if no record exists
*
* @param {function} callback - function that handles the error and results of call
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


/**
 * Fetch all the tasks of for a specified date
 * 
 * @param {function} callback - handles the outcome of the fetch
 */
const fetchTasks = (date, callback) => {
    // const date = new Date().toISOString().slice(0, 10);
    const query = `SELECT * FROM Tasks WHERE due_date = '${date}'`
    connection.query(query, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

/**
 * Fetch all the tasks of for a specified date
 * 
 * @param {function} callback - handles the outcome of the fetch
 */
const fetchNumSnippets = (callback) => {
    // const date = new Date().toISOString().slice(0, 10);
    const query = 'SELECT COUNT(*) AS SnippetCount FROM Snippets';
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
* @param {number} year - year of the task fetched
* @param {number} month - month of the task fetched
* @param {function} callback - function that handles the error and results of call
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
* @param {function} callback - function that handles the error and results of call
*/
const fetchNumberCompleted = (callback) => {

    const sqlQuery = `
        SELECT CASE
                WHEN COUNT(*) > 0 THEN SUM(completed) 
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

/**
 * Updates the completion of a task specified by its id
 * 
 * @param {number} taskId id of the task to be updated
 * @param {boolean} completed state to change the task's completion to
 * @param {function} callback - handles the outcome of the fetch
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
 * @param {function} callback - handles the outcome of the fetch
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
const fetchSnippets = (date, callback) => {
    connection.query(`SELECT * FROM Snippets WHERE created_date LIKE '${date}%'`, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

/**
 * Starts the server with all the routes
 */
export const server = http.createServer((req, res) => {

    // console.log("Running")
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.searchParams;


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
    } else if (pathname === '/tasks' && req.method === 'GET') {
        const date = query.get('date');
        fetchTasks(date, (err, tasks) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tasks));
            }
        });
    } else if (pathname === '/tasks-this-month' && req.method === 'GET') {
        const year = parseInt(query.get('year'), 10);
        const month = parseInt(query.get('month'), 10);
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
    } else if (pathname === '/num-snippets' && req.method === 'GET') {
        // fetches number of snippets created
        fetchNumSnippets((err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            }
        });
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
        const date = query.get('date');
        //fetches snippets
        fetchSnippets(date, (err, snippets) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(snippets));
            }
        });
    } else if (req.url === '/' && req.method === 'GET') {
        console.log('Home page accessed');
        addStreaks((err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            }
        })
        // Update the condition for serving CSS files
    } else if (pathname.endsWith('.css') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/css');
        // Update the condition for serving JavaScript files
    } else if (pathname.endsWith('.js') && req.method === 'GET') {
        serveStaticFile(res, req.url.slice(1), 'text/javascript');
    } else if (pathname.endsWith('.json') && req.method === 'GET') {
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

/**
* Serves static files (html, js, html, images)
*
* @param {object} res - result of the call
* @param {string} filename - name of file
* @param {string} contentType - type of content (html, js, etc.)
*/
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