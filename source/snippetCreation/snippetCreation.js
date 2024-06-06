// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    const snippetForm = document.getElementById('snippet-form');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;
        snippetCompleted(code, language);
    });
    retrieve();
});

//create a POST request using fetch on the frontend
const snippetCompleted = (code, language) => {
    fetch(
        `/add-snippet?code=${code}&language=${language}`,
        { method: 'POST' }
    );
    retrieve();
}

//fetches all snippets and creates json file from them 
async function fetchSnippets() {
    try {
        const response = await fetch('/fetch-snippets');
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
        snippetText.setAttribute("onclick", "copy(this)");
        snippetText.setAttribute("value", `${snippet.code}`)
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

async function retrieve() {
    const snippets = await fetchSnippets();
    displaySnippets(snippets);
}

// Copies a copy snippet's text to the user's clipboard
function copy(button) {
    // Copy the text to clipboard
    navigator.clipboard.writeText(button.value);
}