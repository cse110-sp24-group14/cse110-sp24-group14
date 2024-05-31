window.addEventListener('DOMContentLoaded', init);



function init() {
    const taskButton = document.getElementById('sendTask')

    taskButton.addEventListener('click', function() {
        const input = document.getElementById('taskInput').value
        const taskRegex = /\/task\s+(.*)/;
        const match = input.match(taskRegex);
    
        if (match) {
            // extracted task
            const task = match[1];
            console.log(task); 
        } else {
            // No task found
        }
    
    });
}
