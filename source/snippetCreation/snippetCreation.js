// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    // observes the selected date
    const snippetObserver = new class {
        /**
         * Update the snippets with the new selected date when globalDate is updated
         * 
         * @param {Date} date - new date to fetch snippets from and display  
         */
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

/**
 * Create a POST request using fetch on the frontend
 * 
 * @param {string} code - the value of the code snippet the user types
 * @param {string} language - the language of the snippet the user selects
 */
const snippetCompleted = (code, language) => {
    fetch(
        `/add-snippet?code=${code}&language=${language}`,
        { method: 'POST' }
    );
    retrieve();
    psuedoUpdateSnippetCount();
}

/**
 * Fetches all snippets and creates json file from them 
 * 
 * @param {Date} date - the date to fetch snippets from
 * @returns {JSON} - returns the snippets if successfully fetches or an empty array if failed
 */
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

/**
 * Displays the snippets in the top half of the 'Snippets' grey box
 * 
 * @param {object[]} snippets - array of snippet objects with their code and language attributes 
 */
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

/**
 * Fetches snippets based on the date and displays them to the user
 * 
 * @param {Date} date - the daet to retrieve and display snippets from 
 */
async function retrieve(date) {
    const snippets = await fetchSnippets(date.toISOString().slice(0, 10));
    displaySnippets(snippets);
}

/**
 * Adds 1 to the number of snippets created for the statistics element
 */
function psuedoUpdateSnippetCount() {
    const snippetStats = document.querySelector('snippets-statistics')
    const numSnippets = snippetStats.shadowRoot.getElementById('num-snippets')

    numSnippets.innerText = Number(numSnippets.innerText) + 1;
}

// Copies a copy snippet's text to the user's clipboard
let ongoing;    // define a global variable to access timeout on separate function call
/**
 * Copies a copy snippet's text to the user's clipboard
 * 
 * @param {HTMLElement} button - button that allows copying to user clipboard when clicked
 */
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