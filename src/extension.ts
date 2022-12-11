// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import { window, Uri } from "vscode";

import * as ExtensionCommands from "./ExtensionCommands";
import { Project } from "./Files/Project";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let project: Promise<Project>;

export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let buildGrammarDisposable = vscode.commands.registerCommand(
    //     "bnf-extensions.buildGrammar",
    //     buildGrammar
    // );

    let createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        ExtensionCommands.createConfigFile
    );

    // context.subscriptions.push(buildGrammarDisposable);
    context.subscriptions.push(createConfigFileDisposable);

    project = Project.findTopMostProject(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
