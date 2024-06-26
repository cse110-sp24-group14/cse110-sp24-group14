-- Create database if not exists
CREATE DATABASE IF NOT EXISTS prod;
USE prod;


CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title LONGTEXT NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    priority_tag ENUM('urgent', 'medium', 'deferred') NOT NULL DEFAULT 'deferred'
);

INSERT INTO Tasks (title, due_date)
VALUES 
('Buy groceries', '2024-05-22'),
('Prepare presentation', '2024-05-19'),
('Fix bug #1234', '2024-05-20'),
('Plan team meeting', '2024-05-31'),
('Task 1', '2024-05-31'),
('Task 2', '2024-05-31'),
('Task 3', '2024-05-31');


INSERT INTO Tasks (title, due_date, completed)
VALUES 
('Buy groceries', '2024-05-22', TRUE),
('Buy more groceries', '2024-05-23', FALSE),
('Task 4', '2024-05-31', TRUE),
('Task 5', '2024-05-31', TRUE),
('Task 6', '2024-05-31', TRUE);


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


CREATE TABLE SiteVisits (
    visit_date DATE NOT NULL,
    PRIMARY KEY (visit_date)
);

INSERT INTO SiteVisits (visit_date) VALUES
    ('2024-05-20'),
    ('2024-05-21'),
    ('2024-05-22'),
    ('2024-05-24'),
    ('2024-06-02'),
    ('2024-06-01'),
    ('2024-05-31'),
    ('2024-06-04'),
    ('2024-06-03'),
    ('2024-05-25');

CREATE TABLE Snippets (
    code TEXT NOT NULL,
    code_language VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
