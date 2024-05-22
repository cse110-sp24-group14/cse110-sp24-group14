# Interacting With Database
- Create connection query string in `server.js`
- Create HTTP route in the HTTP server in `server.js`
- Create script in `index.html` that fetches route from `server.js`

# Database Schema

## Tasks
Lists all of the tasks
| Field      | Type         | Default Value | Required | Notes                     |
|------------|--------------|---------------|----------|---------------------------|
| id         | INT          |               | yes      | primary key               |
| title      | VARCHAR(255) |               | yes      |                           |
| due_date   | DATE         |               | yes      |                           |
| completed  | BOOLEAN      | FALSE         | yes      |                           |
| created_at | TIMESTAMP    | time created  | yes      | do not need to touch this |
| updated_at | TIMESTAMP    | time updated  | yes      | updated automatically     |

## Tags
Lists all of the tags we are using
| Field      | Type         | Default Value | Required | Notes                     |
|------------|--------------|---------------|----------|---------------------------|
| id         | INT          |               | yes      | primary key               |
| name       | VARCHAR(255) |               | yes      |                           |
| created_at | TIMESTAMP    | time created  | yes      | do not need to touch this |
| updated_at | TIMESTAMP    | time updated  | yes      | updated automatically     |

## TaskTags
Creates link between tasks and tags
| Field      | Type      | Default Value | Required | Notes                     |
|------------|-----------|---------------|----------|---------------------------|
| task_id    | INT       |               | yes      |                           |
| tag_id     | INT       |               | yes      |                           |
