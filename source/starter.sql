-- Create database if not exists
CREATE DATABASE IF NOT EXISTS Prod;
USE Prod;

-- -- Create users table
-- CREATE TABLE IF NOT EXISTS users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL,
--     email VARCHAR(100) NOT NULL
-- );

-- -- Insert dummy data into users table
-- INSERT INTO users (username, email) VALUES
--     ('user1', 'user1@example.com'),
--     ('user2', 'user2@example.com'),
--     ('user3', 'user3@example.com');


CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO Tasks (title, description, due_date)
VALUES 
('Buy groceries', 'Buy milk, eggs, and bread', '2024-05-22'),
('Prepare presentation', 'Prepare slides for Monday meeting', '2024-05-19'),
('Fix bug #1234', 'Fix the login issue reported by QA', '2024-05-20'),
('Plan team meeting', 'Schedule and prepare agenda for team meeting', '2024-05-25');


CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO Tags (name)
VALUES 
('Urgent'),
('Backlog'),
('Work'),
('Personal');


CREATE TABLE TaskTags (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

INSERT INTO TaskTags (task_id, tag_id)
VALUES 
-- Task 1: "Buy groceries" is tagged with "Backlog" and "Personal"
(1, 2), -- Backlog
(1, 4), -- Personal

-- Task 2: "Prepare presentation" is tagged with "Urgent" and "Work"
(2, 1), -- Urgent
(2, 3), -- Work

-- Task 3: "Fix bug #1234" is tagged with "Urgent" and "Work"
(3, 1), -- Urgent
(3, 3), -- Work

-- Task 4: "Plan team meeting" is tagged with "Work"
(4, 3); -- Work