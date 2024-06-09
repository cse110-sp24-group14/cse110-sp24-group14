window.addEventListener('DOMContentLoaded', init);

function init() {
    const taskButton = document.getElementById('sendTask');
    const taskInput = document.getElementById('taskInput');
    const popupForm = document.getElementById('popupForm');
    const priorityPopupForm = document.getElementById('priorityPopupForm');
    const dueDateForm = document.getElementById('dueDateForm');
    const priorityForm = document.getElementById('priorityForm');
    const sidebar = document.querySelector("side-calendar");
    const headerNumIncomplete = document.getElementById("tasks-to-go");

    let taskTitle = '';
    let due_date = '';
    //watching the input as always to see what command is out.
    taskInput.addEventListener('input', function () {
        const inputValue = taskInput.innerText;
        const taskRegex = /^(\/task\s)(.*)/;
        const match = inputValue.match(taskRegex);

        if (match) {

            taskButton.disabled = false;

            // Extracted task
            const commandText = match[1];
            const titleText = match[2];
            
            taskInput.innerHTML = `<span class="task-command">${commandText}</span> ${titleText.trimStart()}`;
            moveCaretToEnd(taskInput);
            taskTitle = titleText;
        } else {
            taskInput.innerHTML = inputValue;  // Reset the innerHTML if no match
            moveCaretToEnd(taskInput);
            taskButton.disabled = true;
        }
    });

    //once click send , it will triger the popup Form
    taskButton.addEventListener('click', () => {
        taskInput.innerHTML = ''; // Clear the text area
        popupForm.style.display = 'block';
    });

    //once the date popup form is finished submit it will show the priority form
    dueDateForm.addEventListener('submit', (event) => {
        event.preventDefault();
        due_date = document.getElementById('dueDate').value;
        // Hide the popup form and show the priority form
        popupForm.style.display = 'none';
        priorityPopupForm.style.display = 'block';
    });

    //once the priority popup form is finished submit it will POST the task
    priorityForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const priority = document.getElementById('priority').value;
        console.log(priority);
        const data = {
            title: taskTitle,
            due_date: due_date,
            priority: priority
        };
        fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                sidebar.setGlobalDate(sidebar.globalDate); // Re-trigger date update
                headerNumIncomplete.innerText = (Number(headerNumIncomplete.innerText.split(" ")[0]) + 1) + " more to go!";
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        // Hide the priority form and reset the task title and due date
        priorityPopupForm.style.display = 'none';
        taskTitle = '';
        due_date = '';
        // disable button again
        taskButton.disabled = true;
    });

    // always make sure the caret is to the end of the text.
    function moveCaretToEnd(el) {
        el.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

}