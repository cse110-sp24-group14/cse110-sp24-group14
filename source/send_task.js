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
    const infoButton = document.getElementById('infoButton');
    const infoContent = document.getElementById('infoContent');

    infoButton.addEventListener('click', function() {
        if (infoContent.classList.contains('hidden')) {
            infoContent.classList.remove('hidden');
            infoContent.classList.add('visible');
        } else {
            infoContent.classList.remove('visible');
            infoContent.classList.add('hidden');
        }
    });
}
