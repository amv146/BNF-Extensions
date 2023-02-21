import * as path from "path";
import * as vscode from "vscode";

import { Project } from "@/Files/Project";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as ExtensionCommands from "@/ExtensionCommands";
import * as Strings from "@/Strings";
import * as fs from "fs";
import { Config } from "@/Files/Config/Config";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as ProjectUtils from "@/Files/ProjectUtils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let selectProjectStatusBarItem: vscode.StatusBarItem;
let selectedProject: Project | undefined;
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

    selectedProject = ProjectUtils.findTopMostProjects(
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
            if (selectedProject) {
                const inode: number | undefined = (
                    await ProjectUtils.getConfig(selectedProject)
                )?.inode;

                let projects: Project[] = ProjectUtils.findTopMostProjects(
                    path.dirname(document.fileName)
                );

                if (inode === fs.statSync(document.fileName).ino) {
                    ProjectUtils.rewritePackageJson(selectedProject);
                } else {
                    projects = projects.filter(
                        async (project) =>
                            (await ProjectUtils.getInode(project)) === inode
                    );

                    selectedProject = projects[0];
                    ProjectUtils.rewritePackageJson(selectedProject);

                    updateSelectedProjectStatusBarItem();
                }
            } else {
                selectedProject = ProjectUtils.create(document.fileName);

                StorageUtils.addProject(selectedProject);

                const config: Config | undefined = await ProjectUtils.getConfig(
                    selectedProject
                );

                if (config) {
                    PackageUtils.addContributesFromConfig(config);
                }

                updateSelectedProjectStatusBarItem();
            }
        }
    });
}

function registerUpdateStatusBarItemOnEditorChange() {
    vscode.window.onDidChangeActiveTextEditor(async (event) => {
        if (!event) {
            return;
        }

        const projects: Project[] = ProjectUtils.findTopMostProjects(
            path.dirname(event.document.fileName)
        );

        if (projects.length > 0) {
            selectedProject = projects[0];
            ConsoleUtils.log(ProjectUtils.getConfigPath(selectedProject));
        }

        updateSelectedProjectStatusBarItem();
    });
}

async function updateSelectedProjectStatusBarItem() {
    if (selectedProject) {
        selectProjectStatusBarItem.text = `$(file-directory) ${
            (await ProjectUtils.getConfig(selectedProject))?.languageName ??
            "Unknown"
        }`;
        selectProjectStatusBarItem.show();
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
