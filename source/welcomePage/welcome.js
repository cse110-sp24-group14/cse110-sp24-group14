const button = document.getElementById("button");

button.addEventListener("click", () => {
    // Replace 'main-page.html' with the actual filename of your main page HTML file
    window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", async function () {
    try {
        let response1 = await fetch("http://localhost:3000/num-completed");
        let response2 = await fetch("http://localhost:3000/num-incomplete-tasks");
        let response3 = await fetch("http://localhost:3000/streak");
        let response4 = await fetch("http://localhost:3000/num-snippets");

        let completed_tasks = await response1.json();
        let todo_tasks = await response2.json();
        let streaks = await response3.json();
        let num_snippets = await response4.json();

        /**
            * streak count
            * example query to streak --> stored in streaks:
                ('2024-05-20')
                ('2024-05-21')
                ('2024-05-22')
                ('2024-05-24')
                ('2024-05-25')
                ('2024-06-09')
            
            * Procedure:
            *   start from the end of the streaks list dates (most recent date)
            *   new Date() create a date object --> for example, May 25, 2024
            *   subtracting 2 date objects give the difference in milliseconds
            *   1000 miliseconds = 1 second
            *   60 seconds = 1 minute
            *   60 minutes = 1 hour
            */
        let streak_count = 1;
        for (let i = streaks.length - 1; i > 1; i--) {
            let curr_date = streaks[i];
            let prev_date = streaks[i - 1];

            let diff = curr_date - prev_date;

            let diff_in_hours = diff / (1000 * 60 * 60);

            if (diff_in_hours <= 24) {
                streak_count++;
            } else {
                break;
            }
        }

        document.querySelector(".to-do .value").innerHTML =
        todo_tasks[0]["incomplete"];

        document.querySelector(".completed .value").innerHTML =
        completed_tasks[0]["CompletedCount"];

        document.querySelector(".streak .value").innerHTML = streak_count;
        document.querySelector(".snippet .value").innerHTML =
        num_snippets[0]["SnippetCount"];
    } catch (error) {
        console.log(error);
    }
});
