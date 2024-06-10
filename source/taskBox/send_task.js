/**
 * Namespace for sending task inputs
 * @namespace SendTasks
 */
window.addEventListener('DOMContentLoaded', init);

/**
 * Initializes send task functions
 * 
 * @function init
 * @memberof SendTasks
 */
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
    
    const headerNumIncomplete = document.getElementById("tasks-to-go");

    let taskTitle = '';
    let due_date = '';
    //watching the input as always to see what command is out.
    taskInput.addEventListener('input', function () {
        const savedPosition = saveCursorPosition(taskInput);
        const inputValue = taskInput.innerText;
        const taskRegex = /^(\/task\s)(.*)/;
        const match = inputValue.match(taskRegex);

        if (match && match[2].trimStart().length <= 2) {

            taskButton.disabled = false;

            // Extracted task
            const commandText = match[1];
            const titleText = match[2];

            taskInput.innerHTML = `<span class="task-command">${commandText}</span> ${titleText.trimStart()}`;
            moveCaretToEnd(taskInput);
            taskTitle = titleText;

        } else if (match) {

            taskButton.disabled = false;

            // Extracted task
            const commandText = match[1];
            const titleText = match[2];
            
            taskInput.innerHTML = `<span class="task-command">${commandText}</span> ${titleText.trimStart()}`;
            restoreCursorPosition(taskInput, savedPosition);
            taskTitle = titleText;

        } else {

            taskInput.innerHTML = inputValue;  // Reset the innerHTML if no match
            taskButton.disabled = true;
            restoreCursorPosition(taskInput, savedPosition);

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

        // disable submission button
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

                if (data.message === undefined) {
                    status.innerHTML = "Adding task error! Please try again.";
                } else {
                    status.innerHTML = data.message;
                }

                sidebar.setGlobalDate(sidebar.globalDate); // Re-trigger date update
                headerNumIncomplete.innerText = (Number(headerNumIncomplete.innerText.split(" ")[0]) + 1) + " more to go!";
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

    /**
     * Always make sure the caret is to the end of the text.
     * 
     * @function moveCaretToEnd
     * @memberof SendTasks
     * @param {HTMLElement} el - The element to move the cursor position to the end in
     */
    function moveCaretToEnd(el) {
        el.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // "icon-info-sign" displays "extra-info" when tabbed on
    const infoSign = document.querySelector('.icon-info-sign');
    const infoContainer = document.querySelector('.info');

    infoSign.addEventListener('focus', () => {
        infoContainer.classList.add('focus');
    });

    infoSign.addEventListener('blur', () => {
        infoContainer.classList.remove('focus');
    });

    /**
     * Returns the current cursor position
     *
     * @function saveCursorPosition
     * @memberof SendTasks
     * @param {HTMLElement} el - The element to save the cursor position from
     * @returns {number} - The index of the cursor position within the element's text
     */
    function saveCursorPosition(el) {

        // Gets the user's selection
        const selection = window.getSelection();

        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();

        // Select the text content
        preSelectionRange.selectNodeContents(el);

        /* Sets the end of the range to be at the cursor position
        * preSelectionRange is the beginning of the text to the cursor position 
        */
        preSelectionRange.setEnd(range.startContainer, range.startOffset);

        // The length represents the index position
        return preSelectionRange.toString().length;
    }

    /**
     * Sets the cursor's position in an element
     *
     * @function restoreCursorPosition
     * @memberof SendTasks
     * @param {HTMLElement} el - The element to restore the cursor position to
     * @param {number} savedPosition - The index of the cursor position within the element's text
     */
    function restoreCursorPosition(el, savedPosition) {

        const selection = window.getSelection();
        const range = document.createRange();

        // Start the range at the beginning of the element's text
        range.setStart(el, 0);
        range.collapse(true);

        // Use a stack to traverse the text nodes
        let nodeStack = [el], node, charIndex = 0, foundStart = false, stop = false;

        // Traverse all the nodes in the element until we find the saved cursor position.
        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === 3) { // Check node is text

                // Calculate one character over
                const nextCharIndex = charIndex + node.length;
                
                // If we find the cursor position
                if (!foundStart && savedPosition >= charIndex && savedPosition <= nextCharIndex) {

                    // Set the start of the range to the saved cursor position
                    range.setStart(node, savedPosition - charIndex);
                    range.collapse(true);
                    foundStart = true;
                    stop = true;
                }

                // Move to the next character
                charIndex = nextCharIndex;

            } else {

                // If the node is not a text node, add its children to the stack
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }

            }
        }

        selection.removeAllRanges();

        // Set the current cursor selection to the cursor range
        selection.addRange(range);
    }
}
