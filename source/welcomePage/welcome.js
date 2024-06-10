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
    let streak = await response3.json();
    let num_snippets = await response4.json();

    document.querySelector(".to-do .value").innerHTML =
      todo_tasks[0]["incomplete"];

    document.querySelector(".completed .value").innerHTML =
      completed_tasks[0]["CompletedCount"];

    document.querySelector(".streak .value").innerHTML = streak.length;
    document.querySelector(".snippet .value").innerHTML = num_snippets.length;
  } catch (error) {
    console.log(error);
  }
});
