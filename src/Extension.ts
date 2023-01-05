// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import { window, Uri } from "vscode";

import * as ExtensionCommands from "./ExtensionCommands";
import { Project } from "./Files/Project";
import { log } from "./ConsoleUtils";
import { getStorageProjects } from "./StorageUtils";
import { StorageProject } from "./StorageProject";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let selectProjectStatusBarItem: vscode.StatusBarItem;
let projects: Project[] = [];
let selectedProject: Project;
export let storageManager: vscode.Memento;

export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let buildGrammarDisposable = vscode.commands.registerCommand(
    //     "bnf-extensions.buildGrammar",
    //     buildGrammar
    // );
    storageManager = context.globalState;

    selectProjectStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );

    let createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        (file) => {
            ExtensionCommands.createConfigFile(file?.fsPath);
        }
    );

    // context.subscriptions.push(buildGrammarDisposable);
    context.subscriptions.push(createConfigFileDisposable);

    vscode.window.onDidChangeActiveTextEditor(async (event) => {
        if (!event) {
            return;
        }

        const projects: Project[] = Project.findTopMostProjects(
            path.dirname(event.document.fileName)
        );

        if (projects.length > 0) {
            selectedProject = projects[0];
            log(selectedProject.getConfigPath());
        }

        updateSelectedProjectStatusBarItem();
    });

    selectedProject = Project.findTopMostProjects(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
    )[0];
}

async function updateSelectedProjectStatusBarItem() {
    if (selectedProject) {
        selectProjectStatusBarItem.text = `$(file-directory) ${
            (await selectedProject.getConfig())?.languageName ?? "Unknown"
        }`;
        selectProjectStatusBarItem.show();
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
