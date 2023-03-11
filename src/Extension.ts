import * as path from "path";
import * as vscode from "vscode";

import { Project } from "@/Files/Project";
import * as ExtensionCommands from "@/ExtensionCommands";
import * as Strings from "@/Strings";
import * as fs from "fs";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as ProjectUtils from "@/Files/ProjectUtils";

let selectProjectStatusBarItem: vscode.StatusBarItem;
let selectedProject: Project | undefined;
export let storageManager: vscode.Memento;

export function activate(context: vscode.ExtensionContext) {
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
            console.log(file);
            ExtensionCommands.createConfigFile(file?.fsPath);
        }
    );

    let parseBNFFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.parseBNFFile",
        () => {
            ExtensionCommands.parseBNFFile(
                vscode.window.activeTextEditor?.document.fileName || ""
            );
        }
    );

    context.subscriptions.push(createConfigFileDisposable);
    context.subscriptions.push(parseBNFFileDisposable);

    registerUpdateStatusBarItemOnEditorChange();
    registerOnSaveConfigFile();

    updateSelectedProjectStatusBarItem();
}

function registerOnSaveConfigFile() {
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (path.basename(document.fileName) === Strings.configFileName) {
            if (selectedProject) {
                const inode: number | undefined = selectedProject.inode;

                let projects: Project[] = ProjectUtils.findTopMostProjects(
                    path.dirname(document.fileName)
                );

                if (inode === fs.statSync(document.fileName).ino) {
                    ProjectUtils.rewritePackageJson(selectedProject);
                } else {
                    projects = projects.filter(
                        (project) => project.inode === inode
                    );

                    selectedProject = projects[0];
                    ProjectUtils.rewritePackageJson(selectedProject);

                    updateSelectedProjectStatusBarItem();
                }
            } else {
                selectedProject = await ProjectUtils.readConfigIntoProject(
                    document.fileName
                );

                if (selectedProject) {
                    StorageUtils.addProject(selectedProject);

                    PackageUtils.addContributesFromProject(selectedProject);
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
        }

        updateSelectedProjectStatusBarItem();
    });
}

function updateSelectedProjectStatusBarItem() {
    if (selectedProject) {
        selectProjectStatusBarItem.text = `$(file-directory) ${
            selectedProject.languageName ?? "Unknown"
        }`;
        selectProjectStatusBarItem.show();
    }
}

export function deactivate() {}
