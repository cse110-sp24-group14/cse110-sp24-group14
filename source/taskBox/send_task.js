window.addEventListener('DOMContentLoaded', init);

function init() {
    const taskButton = document.getElementById('sendTask');
    const taskInput = document.getElementById('taskInput');
    const closeButton = document.getElementById('closeButton');
    const popupForm = document.getElementById('popupForm');
    const dueDateForm = document.getElementById('dueDateForm');
    const sidebar = document.querySelector("side-calendar");
    const status = document.getElementById('taskStatus');

    const dueInput = document.getElementById('dueDate')
    const priorityInput = document.getElementById('priority')

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
        popupForm.classList.remove('hidden');

        const formTaskTitle = document.getElementById('taskTitle');
        formTaskTitle.innerHTML = taskTitle;
    });

    closeButton.addEventListener('click', () => {
        popupForm.classList.add('hidden');

        // reset date input
        dueInput.value = '';

        // reset selection input
        priorityInput.selectedIndex = 0;

        // disable button again
        taskButton.disabled = true;
    })

    //once the date popup form is finished submit it will show the priority form
    dueDateForm.addEventListener('submit', (event) => {
        event.preventDefault();

        due_date = dueInput.value;
        const priority = priorityInput.value;

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
                popupForm.classList.add('hidden');
                
                status.classList.remove('hidden');

                status.innerHTML = data.message;

                sidebar.setGlobalDate(sidebar.globalDate); // Re-trigger date update
            })
            .catch((error) => {
                console.error('Error:', error);
            });


        setTimeout(() => {
            // Hide the popup form and reset the task title and due date
            status.classList.add('hidden');
            taskTitle = '';
            due_date = '';
            
            // reset date input
            dueInput.value = '';

            // reset selection input
            priorityInput.selectedIndex = 0;

            // disable button again
            taskButton.disabled = true;
        }, 1000)
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