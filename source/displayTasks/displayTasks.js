/**
 * Fetch data from json file and add to table
 *
 * @param {string} date - date to fetch tasks from
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
 * @param {Object} task - task to update
 * @param {boolean} completion - state of completed to update to
 */
const updateCompleted = (id, completion) => {
    // update the task to be completed in SQL database
    fetch(
        `/updated-task-completion?taskId=${id}&completed=${completion}`,
        { method: 'PUT' }
    );
}

/**
 * Calls a DELETE method to delete a task from the SQL database
 * 
 * @param {number} id -- id of the task to be deleted 
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
 * @param {JSON} taskList - list of today's fetched tasks
 */
const populateTable = (taskList) => {

    const table = document.getElementById("task-table");
    table.innerHTML = ""

    // go through each task and create a row
    taskList.forEach((task) => {

        const row = document.createElement("tr");
        row.classList.add(task.completed ? "complete" : "incomplete");

        const cell = document.createElement("td");

        cell.innerHTML = task.title;
        cell.setAttribute("data-id", task.id);
        cell.classList.add("task");

        row.appendChild(cell);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const [complete_button, delete_button] = addButtons();

        // add completion button if incomplete
        if (!task.completed) {
            complete_button.addEventListener("click",() => {

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
            if (task.completed) {
                psuedoUpdateDelete();
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
 * @returns [complete_button, delete_button] - buttons to add to task row
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
 */
const psuedoUpdateCompletedTasks = () => {
    const completeStats = document.querySelector("completed-statistics");
    const numTasks = completeStats.shadowRoot.getElementById("num-tasks");

    numTasks.innerText = Number(numTasks.innerText) + 1;
}

/**
 * Decrements 1 from number of completed tasks for the statistics element
 */
const psuedoUpdateDelete = () => {
    const completeStats = document.querySelector("completed-statistics");
    const numTasks = completeStats.shadowRoot.getElementById("num-tasks");

    numTasks.innerText = Number(numTasks.innerText) - 1;
}

window.addEventListener("DOMContentLoaded", () => {
    // class to allow observing of global selected date
    const taskObserver = new class {
        update(date) {
            try {
                fetchJson(date.toISOString().slice(0, 10));
            } catch (error) {
                console.error(error);
            }
        }
    }();

    taskObserver.update(new Date()); // initial load date

    const sidebar = document.querySelector("side-calendar");
    sidebar.addObserver(taskObserver);
})