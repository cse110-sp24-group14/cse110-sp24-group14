const button = document.getElementById('button');

button.addEventListener('click', () => {
    // Replace 'main-page.html' with the actual filename of your main page HTML file
    window.location.href = '../index.html';
});

document.addEventListener("DOMContentLoaded", async function () {
  try {
    let response1 = await fetch("http://localhost:3000/tasks");
    let response2 = await fetch("http://localhost:3000/streak");
    let response3 = await fetch("http://localhost:3000/num-snippets");

    let tasks = await response1.json();
    let streak = await response2.json();
    let num_snippets = await response3.json();

    let tasks_complete = 0;
    let tasks_todo = 0;
    let streaks = 0;

    for (let t of stats) {
      // completed is a boolean attribute for each task
      if (tasks.completed == true) {
        tasks_complete++;
      } else {
        tasks_todo++;
      }
    }

    /**
         * streak calculation
            ('2024-05-20')
            ('2024-05-21')
            ('2024-05-22')
            ('2024-05-24')
            ('2024-05-25')
        
         * start from the end of the visits list dates (most recent date)
         * new Date() create a date object --> for example, May 25, 2024
         * subtracting 2 date objects give the difference in milliseconds
         * 1000 miliseconds = 1 second
         * 60 seconds = 1 minute
         * 60 minutes = 1 hour
         */
    for (let i = visits.length - 1; i > 1; i--) {
      let curr_date = visits[i];
      let prev_date = visits[i - 1];

      let diff = curr_date - prev_date;

      let diff_in_hours = diff / (1000 * 60 * 60);

      if (diff_in_hours <= 24) {
        streak++;
      } else {
        break;
      }
    }

    document.querySelector(".to-do .value").innerHTML = tasks_todo;
    document.querySelector(".completed .value").innerHTML = tasks_complete;
    document.querySelector(".streak .value").innerHTML = streaks;
  } catch (error) {
    console.log(error);
  }
});