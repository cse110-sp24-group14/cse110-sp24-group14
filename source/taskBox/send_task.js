window.addEventListener('DOMContentLoaded', init);

function init() {
    const taskButton = document.getElementById('sendTask');
    const taskInput = document.getElementById('taskInput');
    const popupForm = document.getElementById('popupForm');
    const dueDateForm = document.getElementById('dueDateForm');
    const sidebar = document.querySelector("side-calendar");
    
    let taskTitle = '';
    //watching the input as always to see what command is out.
    taskInput.addEventListener('input', function() {
        const inputValue = taskInput.innerText;
        const taskRegex = /^(\/task\s)(.*)/;
        const match = inputValue.match(taskRegex);

        if (match) {
            // Extracted task
            const commandText = match[1];
            const titleText = match[2];
            console.log(titleText);

            taskInput.innerHTML = `<span class="task-command">${commandText}</span> ${titleText.trimStart()}`;
            moveCaretToEnd(taskInput);
            taskTitle = titleText;
        } else {
            taskInput.innerHTML = inputValue;  // Reset the innerHTML if no match
            moveCaretToEnd(taskInput);
        }
    });

    //once click send , it will triger the popup Form
    taskButton.addEventListener('click', () => {
        taskInput.innerHTML = ''; // Clear the text area
        popupForm.style.display = 'block';
    });

    //once the popup form is finished submit it will POST the task
    dueDateForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const due_date = document.getElementById('dueDate').value;
        const data = {
            title: taskTitle,
            due_date: due_date
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
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        // Hide the popup form and reset the task title
        popupForm.style.display = 'none';
        taskTitle = '';
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