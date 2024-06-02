const snippetForm = document.getElementById('addSnippet');
const snippetCompleted = (code, language) => {
  fetch(
    `/add-snippet?code=${code}&language=${language}`,
    { method: 'POST' }
  );
}
snippetForm.addEventListener('click', () => {
  //event.preventDefault();
  const code = document.getElementById('codeInput').value;
  const language = document.getElementById('languageSelect').value;
  console.log(code);
  console.log(language);
  /*try {
    // Send the form data to the server using an AJAX request (e.g., fetch, XMLHttpRequest)
    const response = await fetch(`/add-snippet?code=${}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataObject)
    });

    if (response.ok) {
      // Handle the successful response, e.g., display a success message
      console.log('Snippet added successfully');
      // Clear the form inputs
      snippetForm.reset();
    } else {
      // Handle the error response
      console.error('Failed to add the snippet');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});*/

  snippetCompleted('console', 'JavaScript');
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


})

async function renderSnippets() {
  const snippetsContainer = document.getElementById('snippetsContainer');
  snippetsContainer.innerHTML = ''; // Clear existing content

  const snippets = await fetchSnippets();
  snippets.forEach(snippet => {
    const snippetElement = document.createElement('div');
    snippetElement.classList.add('snippet');
    snippetElement.innerHTML = `
        <pre><code>${snippet.code}</code></pre>
        <p>Language: ${snippet.language}</p>
    `;
    snippetsContainer.appendChild(snippetElement);
  });
}
