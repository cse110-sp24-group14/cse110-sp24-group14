# Database Schema

## Tasks
| Field      | Type         | Default Value | Required | Notes                     |
|------------|--------------|---------------|----------|---------------------------|
| id         | INT          |               | yes      | primary key               |
| title      | VARCHAR(255) |               | yes      |                           |
| due_date   | DATE         |               | yes      |                           |
| completed  | BOOLEAN      | FALSE         | yes      |                           |
| created_at | TIMESTAMP    | time created  | yes      | do not need to touch this |
| updated_at | TIMESTAMP    | time updated  | yes      | updated automatically     |

## Tags
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
