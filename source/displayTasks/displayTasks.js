/**
 * Fetch data from json file and add to table
 *
 * @param {String} file
 */
const fetchJson = (file) => {
    fetch(file)
        .then((data) => data.json())
        .then((json) => {
            console.log(json);
            populateTable(json);
        })
        .catch((err) => console.error(err));
};

/**
 * Adds all the tasks to their corresponding table
 *
 * @param {JSON} taskList
 */
const populateTable = (taskList) => {
    
    const table = document.getElementById("task-table");

    // go through each task and create a row
    taskList.forEach((task) => {

        // add corresponding completion class
        const completionClass = (task.completed ? "completed" : "incompleted") + "-task";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.innerHTML = task.title;
        cell.className = completionClass;

        // sets the id for finding task for updating
        cell.setAttribute("data-id", task.id);

        row.appendChild(cell);

        [complete_button, delete_button] = addButtons();

        // add buttons if incomplete
        if (!task.completed) {
            complete_button.onclick = () => {
                cell.className = "completed-task"; // adds strikethrough
            }

            row.appendChild(complete_button);
        }

        delete_button.onclick = () => {
            table.removeChild(row);
        }

        row.appendChild(delete_button);

        table.appendChild(row);
    });
};

const addButtons = () => {
    const complete_button = document.createElement("button");
    const delete_button = document.createElement("button");

    const complete_img = document.createElement("img");
    complete_img.src = "./Check.png";
    complete_img.alt = "Complete"; 

    const delete_img = document.createElement("img");
    delete_img.src = "./TrashSimple.png";
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
 * Creates a row with the input task's information
 *
 * @param {Object} task
 * @returns row element to be added to the table
 */
const createRow = (task, completed) => {
    // create a row element
    const row = document.createElement("tr");

    // date of task
    const date = document.createElement("td");
    // get in format MM/dd
    date.textContent = new Date(task.due_date).toLocaleString(undefined, {
        month: "numeric",
        day: "numeric",
    });

    // description of task
    const description = document.createElement("td");
    if (task.tag !== "") {
        let tag = document.createElement("td");
        tag.innerHTML = task.tag;

        console.log(tag);

        description.innerHTML =
            tag.innerHTML + " " + 
            new Date(task.due_date).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
            }) +
            " | " +
            task.description;
    } else {
        description.innerHTML =
            new Date(task.due_date).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
            }) +
            " | " +
            task.description;
    }

    // if completed, strikethrough
    if (completed) {
        if (completed) {
            description.style.textDecoration = "line-through";
            description.style.textDecoration = "line-through";
        }
    }

    // let complete_button = document.createElement("button");
    // let delete_button = document.createElement("button");
    

    // complete_button.innerHTML = "check";
    // delete_button.innerHTML = "trash";

    let complete_button = document.createElement("button");
    let delete_button = document.createElement("button");

    let complete_img = document.createElement("img");
    complete_img.src = "./Check.png";
    complete_img.alt = "Complete"; 

    let delete_img = document.createElement("img");
    delete_img.src = "./TrashSimple.png";
    delete_img.alt = "Delete"; 

    complete_img.classList.add("row-image");
    delete_img.classList.add("row-image");

    complete_button.classList.add("row-button");
    delete_button.classList.add("row-button");

    complete_button.appendChild(complete_img);
    delete_button.appendChild(delete_img);

    let incomplete_parent = document.getElementById("incomplete-table");
    let complete_parent = document.getElementById("complete-table");

    complete_button.addEventListener("click", function () {
        console.log("CHECK CLICKED");
        description.style.textDecoration = "line-through";
        incomplete_parent.removeChild(row);
        complete_parent.appendChild(row);
        row.removeChild(complete_button);
        row.removeChild(delete_button);
        description.removeEventListener("click", thing);
    });

    delete_button.addEventListener("click", function () {
        console.log("DELETE CLICKED");
        incomplete_parent.removeChild(row);
    });

    row.appendChild(description);
    if (!completed) {
        row.appendChild(complete_button);
        row.appendChild(delete_button);
    }

    description.addEventListener("click", thing);

    function thing() {
        if (!completed) {
            let curr_text = description.innerHTML;

            let input_element = document.createElement("input");
            input_element.value = curr_text;

            description.innerHTML = "";
            description.appendChild(input_element);

            input_element.focus();

            input_element.addEventListener("blur", function () {
                let new_value = input_element.value;

                description.innerHTML = new_value;
            });
        }
    }

    console.log(row);

    return row;
};

try {
    console.log("hi");
    fetchJson("./tasks.json");
} catch (error) {
    console.log("bye");

    console.log(error);
}
