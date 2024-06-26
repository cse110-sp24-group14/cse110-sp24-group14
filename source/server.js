/**
 * Namespace for server functions
 * @namespace Server
 */

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
 * @function insertTask
 * @memberof Server
 * @param {function} callback 
 */
const insertTask = (title, due_date, priority, callback) => {
    const query = 'INSERT INTO Tasks (title, due_date, priority_tag) VALUES (?, ?, ?)';
    console.log('Inserting title:', title);
    console.log('Inserting due_date:', due_date);
    console.log('Inserting priority:', priority);
    connection.query(query, [title, due_date, priority], (error, results) => {
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
 * @function addStreaks
 * @memberof Server
 * @param {function} callback - function that handles the error and results of call
 */
const addStreaks = (callback) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to the start of the day
    const formattedDate = today.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('T')[0];  // Format date as YYYY-MM-DD

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
 * @function fetchTasks
 * @memberof Server
 * @param {string} date - date of the task in format YYYY-MM-DD
 * @param {function} callback - handles the outcome of the fetch
 * 
 * @example
 * // fetch tasks for June 7, 2024
 * fetchTasks('2024-06-07', callback);
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
 * Fetch then number of snippets created in total, regardless of date
 * 
 * @function fetchNumSnippets
 * @memberof Server
 */
const fetchNumSnippets = (callback) => {
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
 * Gets all dates of site visits
 * 
 * @param {Function} callback 
 */
const fetchVisits = (callback) => {
    connection.query('SELECT * FROM SiteVisits', (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

/**
 *  * Gets tasks which are not completed for the current month you are at
 *
 * @function fetchTasksDue
 * @memberof Server
 * @param {number} year - year of the task fetched
 * @param {number} month - month of the task fetched
 * @param {function} callback - function that handles the error and results of call
 * 
 * @example
 * // fetch tasks due in June
 * fetchTasksDue(2022, 6, callback);
 */
const fetchTasksDue = (year, month, callback) => {
    const sqlQuery = 'SELECT * FROM Tasks WHERE YEAR(due_date) = ? AND MONTH(due_date) = ? AND completed = 0';
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
 * @function fetchNumberCompleted
 * @memberof Server
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
 * Gets number of incomplete tasks overall
 * 
 * @param {Function} callback
 */
const fetchNumIncompleteTasks = (callback) => {
    const sqlQuery = 'SELECT COUNT(*) AS incomplete FROM Tasks WHERE completed = 0';
    connection.query(sqlQuery, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}

/**
 * Updates the completion of a task specified by its id
 * 
 * @function updateTaskCompletion
 * @memberof Server
 * @param {number} taskId id of the task to be updated
 * @param {boolean} completed state to change the task's completion to
 * @param {function} callback - handles the outcome of the fetch
 * 
 * @example
 * // update task with id 1 to be completed
 * updateTaskCompletion(1, true, callback);
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
 * @function deleteTask
 * @memberof Server
 * @param {number} taskId - the id of the task to delete
 * @param {function} callback - handles the outcome of the fetch
 * 
 * @example
 * // delete task with id 1
 * deleteTask(1, callback);
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
 * Adds a snippet to the SQL database
 * 
 * @function addSnippet
 * @memberof Server
 * @param {string} code - code content of snippet
 * @param {string} language - language of the code in snippet
 * @param {string} date - date the snippet was created
 * @param {function} callback - handles the outcome of the fetch
 * 
 * @example
 * // add snippet to database
 * addSnippet("console.log('Hello World!)", "JavaScript", callback)
 */
const addSnippet = (code, language, date, callback) => {
    const sqlQuery = `INSERT INTO Snippets (code, code_language, created_date) VALUES ('${code}', '${language}', '${date}')`;
    connection.query(sqlQuery, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

/**
 * Fetches snippets from the SQL database by date
 * 
 * @function fetchSnippets
 * @memberof Server
 * @param {string} date - string date in the format YYYY-MM-DD
 * @param {function} callback - handles the outcome of the fetch 
 * 
 * @example
 * // fetch snippets for date June 7, 2024
 * fetchSnippets("2024-06-07", callback)
 */
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
 * @function server
 * @memberof Server
 */
export const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.searchParams;


    if (req.url === '/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { title, due_date, priority} = JSON.parse(body);
            insertTask(title, due_date, priority, (err) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Task added successfully' }));
                }
            });
        });
    } else if (req.url === '/streak' && req.method === 'GET') {
        // fetches streak days of current week
        fetchVisits((err, daysVisited) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(daysVisited));
            }
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
    } else if (pathname === '/num-incomplete-tasks' && req.method === 'GET') {
        fetchNumIncompleteTasks((err, users) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
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
        const date = query.get('date');
        addSnippet(code, language, date, (err, result) => {
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
    } else if (pathname === '/' && req.method === 'GET') {
        addStreaks((err, results) => {
            if (err) {
                console.error('Error adding streak:', err);
            }
            console.log('Added streak:', results);
            fs.readFile(path.join(__dirname, 'welcomePage', 'welcome.html'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>Internal Server Error</h1>');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        });
    } else if (pathname === '/index.html' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Internal Server Error</h1>');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (pathname === '/fullCalendar/index.html' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'fullCalendar', 'index.html'), (err, data) => {
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
 * @function serveStaticFile
 * @memberof Server
 * @param {object} res - result of the call
 * @param {string} filename - name of file
 * @param {string} contentType - type of content (html, js, etc.)
 * 
 * @example
 * // serve index.html
 * serveStaticFile(res, 'index.html', 'text/html');
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