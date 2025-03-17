"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const codeEditor = vscode.window.activeTextEditor;
if (codeEditor) {
    const selection = codeEditor.selection;
    const selectedText = codeEditor.document.getText(selection);
    // Continue with your code here
}
else {
    // Handle the case when there's no active editor
    vscode.window.showInformationMessage('No active text editor found');
}
function queryOllamaWithSelectedText(cancelToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Get the current file content to use as the prompt
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error("No active editor found.");
        }
        const fileContent = editor.document.getText();
        const prompt = `Please optimize this code: ${fileContent}`; // you can modify or process this as needed
        console.log('Prompt:', prompt);
        try {
            const response = yield fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, model: 'deepseek-r1:1.5b', stream: false, system: 'You are an expert coding assistant and will help the user to optimize the selected code while not outputting anything besides the optimized code, do not list the key optimizations made.' })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            const jsonData = data;
            // Assuming the model's output is under the 'completion' key
            const rawOutput = jsonData.response;
            // Remove any content between <think> and </think> tags (including the tags)
            const cleanedOutput = rawOutput.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            return cleanedOutput;
        }
        catch (error) {
            console.error('Error querying Ollama:', error);
            throw error;
        }
    });
}
function activate(context) {
    // Register a command that sends the entire file content to the Ollama API
    let disposable = vscode.commands.registerCommand('extension.getFullFileSuggestion', () => __awaiter(this, void 0, void 0, function* () {
        // Create an axios cancellation token source
        let cancelSource = axios_1.default.CancelToken.source();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Querying Ollama for suggestions...",
            cancellable: true
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            // If the user cancels the progress, cancel the axios request
            token.onCancellationRequested(() => {
                cancelSource.cancel("Operation cancelled by user");
            });
            try {
                const suggestion = yield queryOllamaWithSelectedText(cancelSource.token);
                if (suggestion) {
                    // Open an output channel to display the suggestion
                    const outputChannel = vscode.window.createOutputChannel("Ollama Suggestions");
                    outputChannel.show();
                    outputChannel.appendLine(suggestion);
                }
                else {
                    vscode.window.showInformationMessage("No suggestion was returned.");
                }
            }
            catch (error) {
                vscode.window.showErrorMessage("Error querying Ollama: " + error.message);
            }
        }));
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map