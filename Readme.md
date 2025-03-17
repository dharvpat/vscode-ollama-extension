# Ollama Copilot
This extension iuses ollama(a Local LLM library) to run a helper in your vscode window. It's functionalities and capabilities will be expanded in future commits. This is a 'learning type-script' project for me and I thought a local co-pilot would be a good starting place.

## Pre-requisites
- ollama
- model of your choosing
- vscode

## Useage
Install this extension
Install ollama
Setup desired model by using `ollama pull`
Change model name in extension.ts, line 25
Start ollama by running `ollama serve`
Open VScode
Select code that you would like to optimize
Run the function using the command Pallette (Cmd/Ctrl + Shift + P)