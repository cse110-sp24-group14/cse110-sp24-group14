/**
 * Fetch data from json file and add to table
 *
 * @param {String} file
 */
const fetchJson = (file) => {
  fetch(file)
    .then((data) => data.json())
    .then((json) => {
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
  // go through each task and create a row

  const taskCount = { incomplete: 0, complete: 0 };

  taskList.forEach((task) => {
    // gets table that the task belongs to
    const completeBool = task.completed ? "complete" : "incomplete";

    const tableId = `${completeBool}-table`;
    const table = document.getElementById(tableId);

    const row = createRow(task, task.completed);
    table.appendChild(row);

    // count number of each task
    taskCount[completeBool] += 1;
  });

  // update the count of both types of tasks
  for (let count in taskCount) {
    const title = document.getElementById(`${count}-title`);
    title.textContent += ` (${taskCount[count]})`;
  }
};

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
  description.textContent =
    new Date(task.due_date).toLocaleString(undefined, {
      month: "numeric",
      day: "numeric",
    }) +
    " | " +
    task.description;

  // if completed, strikethrough
  if (completed) {
    if (completed) {
      description.style.textDecoration = "line-through";
      description.style.textDecoration = "line-through";
    }
  }

  let complete_button = document.createElement("button");
  let delete_button = document.createElement("button");

  complete_button.innerHTML = "check";
  delete_button.innerHTML = "trash";

  let incomplete_parent = document.getElementById("incomplete-table");
  let complete_parent = document.getElementById("complete-table");

  complete_button.addEventListener("click", function () {
    console.log("CHECK CLICKED");
    description.style.textDecoration = "line-through";
    incomplete_parent.removeChild(row);
    complete_parent.appendChild(row);
    row.removeChild(complete_button);
    row.removeChild(delete_button);
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

  description.addEventListener("click", function () {
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
  });

  return row;
};
try {
  console.log("hi");
  fetchJson("./tasks.json");
} catch (error) {
  console.log("bye");

  console.log(error);
}
