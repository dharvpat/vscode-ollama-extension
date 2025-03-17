import * as vscode from 'vscode';
import axios, { CancelTokenSource } from 'axios';

const codeEditor = vscode.window.activeTextEditor;
if (codeEditor) {
  const selection = codeEditor.selection;
  const selectedText = codeEditor.document.getText(selection);
} else {
  vscode.window.showInformationMessage('No active text editor found');
}

async function queryOllamaWithSelectedText(cancelToken: CancelTokenSource['token']): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error("No active editor found.");
  }
  const fileContent = editor.document.getText();
  const prompt = `Please optimize this code: ${fileContent}`;
  console.log('Prompt:', prompt);
  try {
    const response = await fetch(
      'http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({prompt: prompt, model: 'deepseek-r1:1.5b', stream: false, system: 'You are an expert coding assistant and will help the user to optimize the selected code to run more time and space efficiently.'})
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jsonData = data as any;
    const rawOutput: string = jsonData.response;
    const cleanedOutput = rawOutput.replace(/<think>[\s\S]*?<\/think>/g, '').trim(); //cleanup output in case of deepseek
    return cleanedOutput;
  } catch (error) {
    console.error('Error querying Ollama:', error);
    throw error;
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.getOptimizedCode', async () => {
    let cancelSource: CancelTokenSource = axios.CancelToken.source();
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Querying Ollama for suggestions...",
      cancellable: true
    }, async (progress, token) => {
      token.onCancellationRequested(() => {
        cancelSource.cancel("Operation cancelled by user");
      });
      
      try {
        const suggestion = await queryOllamaWithSelectedText(cancelSource.token);
        if (suggestion) {
          const outputChannel = vscode.window.createOutputChannel("Ollama Suggestions");
          outputChannel.show();
          outputChannel.appendLine(suggestion);
        } else {
          vscode.window.showInformationMessage("No suggestion was returned.");
        }
      } catch (error: any) {
        vscode.window.showErrorMessage("Error querying Ollama: " + error.message);
      }
    });
  });

  context.subscriptions.push(disposable);
}