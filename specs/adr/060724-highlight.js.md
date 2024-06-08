# Code Highlighting

## Context and Problem Statement

The users of our project are computer science students, meaning our code snippets need to be readable and discernible.   

## Considered Options

* Prism
* highlight.js

## Decision Outcome

Chosen option: We decided to use `highlight.js` as it auto detects the language, can format all text within given blocks, and can customize to the GitHub dark styling. In addition, it has zero dependencies which allows for reduced complexity and easier maintenance. This allowed us to easily change the style to match our own design.
