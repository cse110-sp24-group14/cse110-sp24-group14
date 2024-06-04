// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    const snippetForm = document.getElementById('snippetForm');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('codeInput').value;
        const language = document.getElementById('languageSelect').value;
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
    const container = document.getElementById('snippets-container');
    container.innerHTML = '';

    snippets.forEach(snippet => {
        const snippetBox = document.createElement('div');
        snippetBox.className = 'snippet-box';

        const snippetText = document.createElement('p');
        snippetText.textContent = snippet.code;

        const snippetDate = document.createElement('p');
        snippetDate.className = 'snippet-date';
        const date = new Date(snippet.created_date);
        console.log('Parsed date:', date);
        snippetDate.textContent = `Created on: ${date.toLocaleDateString()}`;

        snippetBox.appendChild(snippetText);
        snippetBox.appendChild(snippetDate);

        container.appendChild(snippetBox);
    });
}

async function retrieve() {
    const snippets = await fetchSnippets();
    displaySnippets(snippets);
}
