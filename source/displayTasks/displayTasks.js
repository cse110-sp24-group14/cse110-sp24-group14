/**
 * Namespace for display task function
 * @namespace DisplayTasks
 */

/**
 * Fetch data from json file and add to table
 * 
 * @function fetchJson
 * @memberof DisplayTasks
 * @param {string} date - date to fetch tasks from
 * 
 * @example
 * // fetches the json for date June 7, 2024
 * fetchJson('2024-06-07');
 */
const fetchJson = (date) => {
    fetch(`/tasks?date=${date}`)
        .then((data) => data.json())
        .then((json) => {
            populateTable(json);
        })
        .catch((err) => console.error(err));
};

/**
 * Calls a PUT method to update the completed column in the SQL database
 * 
 * @function updateCompleted
 * @memberof DisplayTasks
 * @param {number} id - id of task to update
 * @param {boolean} completion - state of completed to update to
 * 
 * @example
 * // updates task with id 1 to be completed
 * updateCompleted(1, true);
 * @example
 * // updates task with id 2 to not be completed
 * updateCompleted(2, false);
 */
const updateCompleted = (id, completion) => {
    // update the task to be completed in SQL database
    console.log(id, completion);
    fetch(
        `/updated-task-completion?taskId=${id}&completed=${completion}`,
        { method: 'PUT' }
    );
}

/**
 * Calls a DELETE method to delete a task from the SQL database
 * 
 * @function deleteTask
 * @memberof DisplayTasks
 * @param {number} id - id of the task to be deleted 
 * 
 * @example
 * // delete a task with id 1
 * deleteTask(1)
 */
const deleteTask = (id) => {
    fetch(
        `/delete-task?taskId=${id}`,
        { method: 'DELETE' }
    );
}

/**
 * Adds all the tasks to their corresponding table
 *
 * @function populateTable
 * @memberof DisplayTasks
 * @param {JSON} taskList - list of today's fetched tasks
 * 
 * @example
 * // populate table with list with one task
 * populateTable([
*       {
        "id": 4,
        "title": "Plan team meeting",
        "due_date": "2024-05-31T07:00:00.000Z",
        "completed": 1,
        "created_at": "2024-06-07T15:17:40.000Z",
        "updated_at": "2024-06-07T15:47:42.000Z",
        "priority": "low"
        }
    ]);
 */
const populateTable = (taskList) => {
    const table = document.getElementById("task-table");
    table.innerHTML = ""

    // go through each task and create a row
    taskList.forEach((task) => {

        const row = document.createElement("tr");
        row.classList.add(task.completed ? "complete" : "incomplete");

        const cell = document.createElement("td");
        cell.setAttribute("data-id", task.id);
        cell.classList.add("task");

        const prioritySpan = document.createElement("span");
        prioritySpan.classList.add("priority-tag");
        // Set border and text color based on priority
        let borderColor, textColor;
        switch (task['priority_tag'].toLowerCase()) {
        case 'urgent':
            borderColor = '#e65500';
            textColor = '#e65500';
            break;
        case 'medium':
            borderColor = '#d99100';
            textColor = '#d99100';
            break;
        case 'deferred':
            borderColor = '#388e3c';
            textColor = '#388e3c';
            break;
        default:
            borderColor = 'gray';
            textColor = 'gray';
        }

        prioritySpan.style.border = `1.5px solid ${borderColor}`;
        prioritySpan.style.borderRadius = "5px";
        prioritySpan.style.padding = "2px 5px";
        prioritySpan.style.color = textColor;
        prioritySpan.style.marginRight = "10px"; // Change to marginRight to create space between label and title
        prioritySpan.style.fontStyle = "italic"; // Make the text italic
        prioritySpan.style.whiteSpace = "nowrap"; // Ensure the text doesn't wrap

        // Create a span for the bullet point
        const bulletSpan = document.createElement("span");
        bulletSpan.innerHTML = "&#8226;";
        bulletSpan.style.fontSize = "0.9em"; // Adjust the font size to make it match figma design
        bulletSpan.style.alignItems = "center";

        // Add the bullet point and priority text to the prioritySpan
        prioritySpan.appendChild(bulletSpan);
        prioritySpan.appendChild(document.createTextNode(` ${task['priority_tag'].charAt(0).toUpperCase() + task['priority_tag'].slice(1)}`)); 

        cell.appendChild(prioritySpan);

        const titleSpan = document.createElement("span");
        titleSpan.innerHTML = task.title;
        cell.appendChild(titleSpan);

        row.appendChild(cell);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const [complete_button, delete_button] = addButtons();

        // add completion button if incomplete
        if (!task.completed) {
            complete_button.addEventListener("click", () => {

                updateCompleted(task.id, true) // update database
                psuedoUpdateCompletedTasks() // update statistics

                row.classList.remove("incomplete"); // removes strikethrough
                row.classList.add("complete"); // adds strikethrough

                table.removeChild(row)

                // remove completed button
                buttonContainer.removeChild(complete_button);

                // indicates if a completed task was found
                let found = false;
                // loop through the table to find the first element that is completed for insertion
                for (const child of table.children) {
                    if (child.classList[1] === "complete") {
                        table.insertBefore(row, child);
                        found = true;
                        break;
                    }
                }

                // if didn't find any, add to the end
                if (!found) {
                    table.appendChild(row);
                }

            });

            buttonContainer.appendChild(complete_button);
        }

        delete_button.addEventListener("click", () => {
            deleteTask(task.id)
            table.removeChild(row);

            // decrement complete statistic ONLY if completed
            if (row.className === "complete") {
                psuedoUpdateDeleteCompleteTasks();
            }

            //decrement "more tasks to go" statistic ONLY if delete operation is done on incomplte task
            if (row.className === "incomplete") {
                pseudoUpdateDeleteIncompleteTasks();
            }

        });

        buttonContainer.appendChild(delete_button);
        row.appendChild(buttonContainer);

        if (task.completed) {
            table.appendChild(row);
        } else {
            table.prepend(row);
        }
    });

    // No task message
    if (taskList.length === 0) {
        table.innerHTML = "No tasks. Add a task for the day!"
    }

};


/**
 * Creates the complete and delete buttons 
 * 
 * @function addButtons
 * @memberof DisplayTasks
 * @returns {HTMLElement[]} [complete_button, delete_button] - buttons to add to task row
 */
const addButtons = () => {
    const complete_button = document.createElement("button");
    const delete_button = document.createElement("button");

    const complete_img = document.createElement("img");
    complete_img.src = "displayTasks/Check.png";
    complete_img.alt = "Complete";

    const delete_img = document.createElement("img");
    delete_img.src = "displayTasks/TrashSimple.png";
    delete_img.alt = "Delete";

    complete_img.classList.add("row-image");
    delete_img.classList.add("row-image");

    complete_button.classList.add("row-button");
    delete_button.classList.add("row-button");

    complete_button.appendChild(complete_img);
    delete_button.appendChild(delete_img);

    return [complete_button, delete_button];
}

/**
 * Adds 1 to the number of completed tasks for the statistics element
 * 
 * @function psuedoUpdateCompletedTasks
 * @memberof DisplayTasks
 */
const psuedoUpdateCompletedTasks = () => {
    const completeStats = document.querySelector("completed-statistics");
    const numTasks = completeStats.shadowRoot.getElementById("num-tasks");
    const headerNumCompleted = document.getElementById("tasks-completed");
    const headerNumIncomplete = document.getElementById("tasks-to-go");
    const completedTasks = Number(numTasks.innerText) + 1;

    // Updates dashboard and header counter respectively
    numTasks.innerText = completedTasks;
    if (completedTasks == 1) {
        headerNumCompleted.innerText = `1 task completed`;
    }
    else {
        headerNumCompleted.innerText = `${completedTasks} tasks completed`;
    }
    headerNumIncomplete.innerText = (Number(headerNumIncomplete.innerText.split(" ")[0]) - 1) + " more to go!";
}

/**
 * Decrements 1 from number of incompleted tasks for the statistics element
 * 
 * @function psuedoUpdateDeleteIncompleteTasks
 * @memberof DisplayTasks
 */
const pseudoUpdateDeleteIncompleteTasks = () => {
    const headerNumIncomplete = document.getElementById("tasks-to-go");
    headerNumIncomplete.innerText = (Number(headerNumIncomplete.innerText.split(" ")[0]) - 1) + " more to go!";
}

/**
 * Decrements 1 from number of completed tasks for the statistics element
 * 
 * @function psuedoUpdateDeleteCompleteTasks
 * @memberof DisplayTasks
 */
const psuedoUpdateDeleteCompleteTasks = () => {
    const completeStats = document.querySelector("completed-statistics");
    const numTasks = completeStats.shadowRoot.getElementById("num-tasks");
    const headerNumCompleted = document.getElementById("tasks-completed");
    const completedTasks = Number(numTasks.innerText) - 1;

    // Updates dashboard and header counter respectively
    numTasks.innerText = completedTasks;
    if (completedTasks == 1) { headerNumCompleted.innerText = `1 task completed`; }
    else { headerNumCompleted.innerText = `${completedTasks} tasks completed`; }
}

/**
 * Changes the task list header to have the current selected date
 * 
 * @function addDateToHeader
 * @memberof DisplayTasks
 * @param {Date} date - date to display in the header text
 * 
 * @example
 * // add date 6/7/2024 to the header
 * addDateToHeader(new Date(2024, 5, 7));
 */
const addDateToHeader = (date) => {
    const header = document.querySelector("div[id='task-container'] h1");
    const dateOptions = {
        month: "numeric",
        day: "numeric",
        year: "numeric"
    }
    header.innerText = date.toLocaleDateString(undefined, dateOptions) + " Tasks";
}

window.addEventListener("DOMContentLoaded", () => {
    // class to allow observing of global selected date
    const taskObserver = new class {
        /**
         * Updates the task list based on the selected date
         * 
         * @function update
         * @memberof DisplayTasks
         * @param {Date} date - new date to fetch tasks from and display in header 
         */
        update(date) {
            try {
                const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                fetchJson(normalizedDate.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }));
                addDateToHeader(date);
            } catch (error) {
                console.error(error);
            }
        }
    }();
    
    const sidebar = document.querySelector("side-calendar");

    taskObserver.update(sidebar.globalDate); // initial load date

    
    sidebar.addObserver(taskObserver);
})