import * as path from "path";
import * as vscode from "vscode";

import { Project } from "@/Files/Project";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as ExtensionCommands from "@/ExtensionCommands";
import * as Strings from "@/Strings";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let selectProjectStatusBarItem: vscode.StatusBarItem;
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

    selectedProject = Project.findTopMostProjects(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
    )[0];

    let createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        (file) => {
            ExtensionCommands.createConfigFile(file?.fsPath);
        }
    );

    // context.subscriptions.push(buildGrammarDisposable);
    context.subscriptions.push(createConfigFileDisposable);

    registerUpdateStatusBarItemOnEditorChange();
    registerOnSaveConfigFile();

    updateSelectedProjectStatusBarItem();
}

function registerOnSaveConfigFile() {
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (path.basename(document.fileName) === Strings.configFileName) {
            selectedProject.rewritePackageJson();
        }
    });
}

function registerUpdateStatusBarItemOnEditorChange() {
    vscode.window.onDidChangeActiveTextEditor(async (event) => {
        if (!event) {
            return;
        }

        const projects: Project[] = Project.findTopMostProjects(
            path.dirname(event.document.fileName)
        );

        if (projects.length > 0) {
            selectedProject = projects[0];
            ConsoleUtils.log(selectedProject.getConfigPath());
        }

        updateSelectedProjectStatusBarItem();
    });
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
