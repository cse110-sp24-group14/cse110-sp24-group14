/**
 * Creates class CreatedSnippets to initialize a custom HTML element to display snippet stats.
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
     */
    connectedCallback() {
        const statsDiv = document.createElement('div')
        statsDiv.id = "stats-div"
        this.shadowRoot.appendChild(statsDiv);

        const svgDiv = document.createElement('div');
        svgDiv.id = "svg-div";

        const numSnippets = document.createElement('p');
        numSnippets.id = "num-snippets";

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
    */
    loadStyles() {
        const styles = document.createElement('style');

        styles.innerHTML = `
          #stats-div {
              width: inherit;
              height: 100%;

              background-color: #F6F6F6;
              border-radius: 12px;

              display: grid;
              grid-template-columns: 1fr 2fr;
              grid-template-rows: 25px 35px;

              align-content: center;
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
          
          @media (max-width: 768px) {
            #svg-div {
                width: 40px;
                height: 40px;
            }
            
            #svg-div svg {
                width: 30px;
                height: 30px;
            }

            #num-snippets {
                font-size: 20px;
            }

            #stats-div {
                width: 100%;
            }

          }
      `;

        this.shadowRoot.appendChild(styles);
    }

    /**
    * Loads the SVG icon for the component
    */
    loadSVG() {
        const svgDiv = this.shadowRoot.getElementById('svg-div');
        svgDiv.innerHTML = `
            <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="38.4" height="38.4" fill="url(#pattern0_193_355)"/>
                <defs>
                <pattern id="pattern0_193_355" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_193_355" transform="scale(0.01)"/>
                </pattern>
                <image id="image0_193_355" width="100" height="100" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADkElEQVR4nO3dP2gUQRTH8UUQOwUb7VX804hooRZa2thaiK0IIkHMzbskNrG3stJCDYgK2oq2NtmZC0RE7YQg5t4cCSSKjQpqTia5M2fMmWM3O/N29veFKS83u5/M7h657CYJQgghhBBCpW/OjO2yaf0Mp3S2aWhf6PlUto+Tao816hlr9csaancHG/WqldZOhZ5fpeJJdcIaWuyFWIPyw6Z0PvQ8K1GzUT/Omr70w1gd6tusHt0ber7RZw1d3Riju1LoTuj5ViJuKDUQiFYfQs+1MvFgKN835c1ajdohq+tjVtOENfQ00vHEbWehKFo1c0HMTI/sYKMes6alQY+TZRysaYmNurzR/pievrQ1Dwpr9SAnBr0LvbOsEAx3aevOAZwOH8mCwoZ+NhsjhzODuJURemdZURh/Lm0Xs6CwoVpmDHcsxWFqXYx2RpQbSZ6spuuhf3utvJXx99BqYSCUtH4yF0YHZCJqjFRdyYWxOj63puhY7h2+IcjKZWDwnWdlY/hDiRGEi8HwgxIbCBeLUTxKTCC8GSfwQYdWdYCY4Cuj815qPCmqGFYIx4IRAwjHhFF2EI4No8wgHCNGWUE4VowygnDMGGUD4dgxygTCVcDYCIQ1nZMyWppOe/kEnvfvGUWCJCWKy74yYgLhWDBiAOGYMMoO0hz4u7b5zhnvXwxt87NFJQZhTyuDJ2k/a7rlZ6tKCsIeMaymlttHfrashCDsH8O9BiCCMAAiDAMgwjAAEuLS1sVazfV5Pc4hrlajdtQa9anoldHtPz8HIC3PGAARhuHCChGE4QKIIAwXQNZkDb32cTXVL4D01G6Pb7GGvoZYGd0A8s8NXcJhuADSk7vFUUgMF0Ay3LKiKAwXQHqyRt0LibEyh77vV71P6taQDonRmQNAug36+aPILyQApNP8lNrdF8DQvNX00hp122q6kBQYQDq5+xSyVjNWq+dW002r6aL7J/xZfW1n4jGACAsgwgKIsAAiLIAICyDCAoiwACIsgAgLIMICiLAAIiyACAsgwgKIsAAiLIAICyDCAoiwACIsGSBa3c/6ndqqDDZ01yNI3I+rsJsy1Kg3kJapH4z9gS42x1h+vGo6fCDxGRt6FHrDrdCR6+FeWVtoDG23Rr0NvfFW2tD0xu0b7yBdFDbqIQ5ftHyYcisjGMbac4o1NBL5gyWfrjvcNmtV937OQAghhBBCCCGEEEIIoaSn33Dh4/DnxAXpAAAAAElFTkSuQmCC"/>
                </defs>
            </svg>
      `;
    }

    /**
    * Gets number of snippets created in totality from fetching specific query.
    * Assigns it to shadowRoot element corresponding to box text.
    */
    getNumSnippets() {
        fetch('/num-snippets')
            .then(response => response.json())
            .then(data => {
                const paragraph = this.shadowRoot.getElementById("num-snippets");
                paragraph.innerHTML = data[0].SnippetCount;
            })
            .catch(error => console.error('Error fetching number of snippets created:', error));
    }
}

customElements.define("snippets-statistics", CreatedSnippets)
