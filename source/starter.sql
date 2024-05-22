-- Create database if not exists
CREATE DATABASE IF NOT EXISTS prod;
USE prod;


CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO Tasks (title, due_date)
VALUES 
('Buy groceries', '2024-05-22'),
('Prepare presentation', '2024-05-19'),
('Fix bug #1234', '2024-05-20'),
('Plan team meeting', '2024-05-25');


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
    ('2024-05-25');
