// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    // observes the selected date
    const snippetObserver = new class {
        update(date) {
            retrieve(date);
        }
    }();

    snippetObserver.update(new Date()); // initial load date

    const sidebar = document.querySelector("side-calendar");
    sidebar.addObserver(snippetObserver);

    const snippetForm = document.getElementById('snippet-form');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;
        snippetCompleted(code, language);
        // Alert message
        let text = document.getElementById("alert");
        text.textContent = "Snippet added!";
        if (text.classList.contains("fade-in")) {clearTimeout(ongoing);}    // if prev call in action: reset timer
        else {text.classList.add("fade-in");}                               // else, create message
        ongoing = setTimeout(function () {
            text.classList.remove("fade-in");
        }, 2000); // Set time out to three seconds to account for the second the element fades in

        retrieve(sidebar.globalDate);
    });
});

//create a POST request using fetch on the frontend
const snippetCompleted = (code, language) => {
    fetch(
        `/add-snippet?code=${code}&language=${language}`,
        { method: 'POST' }
    );
}

//fetches all snippets and creates json file from them 
async function fetchSnippets(date) {
    try {
        const response = await fetch(`/fetch-snippets?date=${date}`);
        if (!response.ok) {
            throw new Error('Failed to fetch snippets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching snippets:', error);
        return [];
    }
}

// displays the snippets in the top half of the 'Snippets' grey box
function displaySnippets(snippets) {
    const container = document.getElementById('snippet-container');
    container.innerHTML = '';

    snippets.forEach(snippet => {
        // External conatiner for entire snippet
        const snippetBox = document.createElement('div');
        snippetBox.className = 'snippet-box';

        // Code Snippet
        const snippetText = document.createElement('button');
        snippetText.className = "snippet-button";
        snippetText.textContent = snippet.code;
        snippetText.setAttribute("value", `${snippet.code}`)

        snippetText.addEventListener("click", () => { copy(snippetText) });

        // Language
        const snippetType = document.createElement('p');
        snippetType.className = 'snippet-type';
        snippetType.textContent = snippet.code_language;

        // Add box to container
        snippetBox.appendChild(snippetText);
        snippetBox.appendChild(snippetType);    
        container.appendChild(snippetBox);
    });
}

async function retrieve(date) {
    const snippets = await fetchSnippets(date.toISOString().slice(0, 10));
    displaySnippets(snippets);
}

// Copies a copy snippet's text to the user's clipboard
let ongoing;    // define a global variable to access timeout on separate function call
function copy(button) {
    // Copy the text to clipboard
    navigator.clipboard.writeText(button.value);

    // Alert message
    let text = document.getElementById("alert");
    text.textContent = "Copied to clipboard!";
    if (text.classList.contains("fade-in")) {clearTimeout(ongoing);}    // if prev call in action: reset timer
    else {text.classList.add("fade-in");}                               // else, create message
    ongoing = setTimeout(function () {
        text.classList.remove("fade-in");
    }, 2000); // Set time out to three seconds to account for the second the element fades in
}