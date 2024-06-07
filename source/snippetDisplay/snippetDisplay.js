/**
 * creates class CreatedSnippets to initialize a custom HTML element to display snippet stats.
 * @class
 * @extends HTMLElement
 */
class CreatedSnippets extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    /**
     * Creates and appends statistics HTML structures to the shadow DOM.
     * @function connectedCallback
     * @memberof SnippetDisplay
     */
    connectedCallback() {
        const statsDiv = document.createElement('div')
        statsDiv.id = "stats-div"
        this.shadowRoot.appendChild(statsDiv);

        const svgDiv = document.createElement('div');
        svgDiv.id = "svg-div";

        const numSnippets = document.createElement('p');
        numSnippets.id = "num-snippets";
        console.log(numSnippets.innerHTML);

        const caption = document.createElement('p');
        caption.id = "snippet-caption"
        caption.innerText = "Total snippets created";

        statsDiv.append(svgDiv, numSnippets, caption);

        this.loadStyles();
        this.loadSVG();
        this.getNumSnippets();
    }

    /**
    * Loads the styles of the statistics component
    * @function loadStyles
    * @memberof SnippetDisplay
    */
    loadStyles() {
        const styles = document.createElement('style');

        styles.innerHTML = `
          #stats-div {
              width: 300px;
              height: 60px;
              
              background-color: #F6F6F6;
              border-radius: 12px;
              
              padding: 10px;
          
              display: grid;
              grid-template-columns: 1fr 2fr;
              grid-template-rows: 25px 35px;
          } 
          
          #svg-div {
              /* circle behind svg */
              background-color: #E5C7754D;
              border-radius: 50%;
          
              width: 65px;
              height: 65px;
              
              /* align within cell */
              grid-row: span 2;
              justify-self: center;
              align-self: center;
          
              /* align inner svg */
              display: flex;
              justify-content: center;
              align-items: center;
          }
          
          p {
              font-family: Verdana, Geneva, Tahoma, sans-serif;
              margin: 0;

              align-self: center;
          }
          
          #num-snippets {
              font-size: 24px;
              font-weight: 600;
          }
          
          #snippet-caption {
              color: #2D2E2EB2;
          }        
      `;

        this.shadowRoot.appendChild(styles);
    }

    /**
    * Loads the SVG icon for the component
    * @function loadSVG
    * @memberof SnippetDisplay
    */
    loadSVG() {
        const svgDiv = this.shadowRoot.getElementById('svg-div');
        svgDiv.innerHTML = `
          <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <rect width="38.4" height="38.4" fill="url(#pattern0_193_330)"/>
              <defs>
                  <pattern id="pattern0_193_330" patternContentUnits="objectBoundingBox" width="1" height="1">
                  <use xlink:href="#image0_193_330" transform="scale(0.01)"/>
                  </pattern>
                  <image id="image0_193_330" width="100" height="100" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAESElEQVR4nO2dPWxcRRDHn6Dlm4aPJny2fAnRABGQNg2QJkAB1AiSN+M7QZEgCFAjgZTWpQMKPYUFuZt5RqYCAohEYN/sBZNAmxhEHlpjMOHOT+fi7ez5/j9pavvNb2d3b3ffvqIAAAAAAAAAgCmjXjhwtQntM+F3TWg+KC/MUpjQ/Oaz74u5cJUxqPgJEzodlGsE1yb8zVB4r4uMYcUvmNIfEMFXNMaYk6HS80llDLR8JAitQwaP7xmE1of98uFkQky5Bxnc2E2b0OdJZAyU74EMnmjMtKXD97YuJEj5cttCTHjZhI5PRSid3PY5dO7F1oWY0hsJKuRoMUXEBjR+LOHXW//jMVkQciVBeNGtYUHIKBCSGRCSGRCSGRCSGRCSGRCSGRCSGRCSGa5CrCLCL/UtLlSvXBeEV8evZXFZtM2gmnu2fSF0MSj9Nh3Bl7Z7jqHOPd26kJVT3RuD8O9YgufmRiW0fna5c32RgiD8IYRw8xaC8vtFKlbl0E1B+Qyk8HZd7g+xJylSstKju0z5W0jh/22u0emYm8KDtcUj1wSlN015bdbF2N85OBpzUmRxWK5H95uU+034wGxFuX9Qde6r6yNXeXsAAIBpZFUO3R6PT5owB+XOLIUJc3z2lR7f5u1hc+pLJ034svcsJ3jPsoQvm9DHP3/RvdNFxrBfPr65luOejJBX/Boqfix5ZUAGN0o5V5V3JBPSdHwSwf90YR8lkREHL4wZPNGYEic7rQuJM4rdXQUUx8VPJ43GN8iEn2tdSFDq+ieN2wvhxZ3kIy6ZNCyydopdcra3nhYhs3LYuoYQCKlRId7VoOiy/BOuEOKfZIUQ/8QqhPgnUyHEP4EKIfgdktcPQyydZLV0gsVF3sHiIh1sXQiW33miccuE/vxp+bVbixTEvWP3wVczD6ETRSriRv7G3rH3Q2umIXThnHb2FCmJG/mQwmNlBO08WngQN/Lj3nHsL91bpfrGRg6ETiSvjHHEwStuV8YpsQm9N0sR4s8AoYNrS3SLtwcAAJhG4gs7QfjBWX1hx/qHH3C/1fo/L82/bcLnvWc5wXuWpfRLEHrrfI+vdZGxcV2s8PfeiQjZBX23Kt27k8qwpe7NJnTW/+E51zgTXx1PJ0ToeAYPXWcdQh8kkYGrNXhSIes/Lr56Q+tC4szCvfXpuHC7gObidv/TUOmZ3XI9U73TKJyIsyrX65lyPdtbOILD1gohqJAGUCGKCtlqDRhDRkCFKCpkqzWgQkZAhSgqZKs1oEJGQIUoKiT1R8Hqafqlbkpfun0UzPr8knfyw7h1I7dP5/Enrp/Ni7th3skPUxJxV7VIgQmd8n7YkHmY8mdFKuKHd/FxYm4ScmlYlQ8lE/LvrUC4lL8ekRFzkuIWoLFShPea0Nfe3UPIJEz5q+TX+4291brPT5nSOyY0H5QXZilMaN6Ujg2q8sksDssBAAAAAAAAQLEz/gLrCq5ZG+nJVwAAAABJRU5ErkJggg=="/>
              </defs>
          </svg>
      `;
    }

    /**
    * Gets number of snippets created in totality from fetching specific query.
    * Assigns it to shadowRoot element corresponding to box text.
    * @function getNumSnippets 
    */
    getNumSnippets() {
        fetch('/num-snippets')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const paragraph = this.shadowRoot.getElementById("num-snippets");
                paragraph.innerHTML = data[0].SnippetCount;
                console.log(paragraph.innerHTML)
            })
            .catch(error => console.error('Error fetching number of snippets created:', error));
    }
}

customElements.define("snippets-statistics", CreatedSnippets)
