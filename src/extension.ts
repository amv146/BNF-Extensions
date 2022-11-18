// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { window } from "vscode";
import * as FileUtils from "./Files/FileUtils";
import * as TerminalUtils from "./TerminalUtils";
import { ProjectDirectory } from "./Files/ProjectDirectory";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let projectDirectory: ProjectDirectory;

export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "bnf-extensions" is now active!'
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand(
        "bnf-extensions.buildGrammar",
        buildGrammar
    );

    context.subscriptions.push(disposable);
}

export async function buildGrammar() {
    const grammarPath: string =
        window.activeTextEditor?.document.uri.fsPath ?? "";

    projectDirectory = new ProjectDirectory(grammarPath);

    vscode.window.showInformationMessage(
        projectDirectory.getProjectDirectory()
    );

    await TerminalUtils.executeCommand(
        "mkdir -p " + projectDirectory.getBuildDirectory(),
        projectDirectory.getProjectDirectory()
    );

    vscode.window.showInformationMessage(projectDirectory.getBuildDirectory());

    await TerminalUtils.executeCommand(
        "bnfc -m --haskell " + projectDirectory.getGrammarPath(),
        projectDirectory.getBuildDirectory()
    );
}

export function isGrammarInGrammarParentFolder(grammarPath: vscode.Uri) {
    const parentFolder = grammarPath.fsPath.split("/").slice(0, -1).join("/");
}

// This method is called when your extension is deactivated
export function deactivate() {}
