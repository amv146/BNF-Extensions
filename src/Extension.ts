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
        vscode.window.activeTextEditor?.document.fileName || ""
    )[0];

    let createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        async (file) => {
            ExtensionCommands.createConfigFile(file?.fsPath);
        }
    );

    let parseBNFFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.parseBNFFile",
        async () => {
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
        if (path.basename(document.fileName) !== Strings.configFileName) {
            return;
        }

        if (selectedProject) {
            const currentProjectLanguageId: string = selectedProject.languageId;

            const languageId: string = ProjectUtils.getLanguageId(
                fs.statSync(document.fileName).ino
            );

            if (currentProjectLanguageId === languageId) {
                selectedProject = await updateProject(selectedProject);
            } else {
                const projects: Project[] = ProjectUtils.findTopMostProjects(
                    document.fileName
                );

                const newSelectedProject: Project | undefined = projects.find(
                    (project) => project.languageId === languageId
                );

                if (newSelectedProject) {
                    selectedProject = await updateProject(newSelectedProject);
                } else {
                    selectedProject = await ProjectUtils.readConfigIntoProject(
                        document.fileName
                    );

                    if (!selectedProject) {
                        selectedProject = projects[0];
                    }
                }
            }
        } else {
            selectedProject = await ProjectUtils.readConfigIntoProject(
                document.fileName
            );
        }

        if (selectedProject) {
            selectedProject = await updateProject(selectedProject);
        }

        updateSelectedProjectStatusBarItem();
    });
}

async function updateProject(project: Project): Promise<Project | undefined> {
    const newProject: Project | undefined =
        await ProjectUtils.readConfigIntoProject(project.configPath);

    if (!newProject) {
        return undefined;
    }

    StorageUtils.addProject(newProject);
    ProjectUtils.rewritePackageJson(newProject);

    return newProject;
}

function registerUpdateStatusBarItemOnEditorChange() {
    vscode.window.onDidChangeActiveTextEditor(async (event) => {
        if (!event) {
            return;
        }

        const projects: Project[] = ProjectUtils.findTopMostProjects(
            event.document.fileName
        );

        if (projects.length > 0) {
            selectedProject = projects[0];
        } else {
            selectedProject = undefined;
        }

        updateSelectedProjectStatusBarItem();
    });
}

function updateSelectedProjectStatusBarItem() {
    if (selectedProject) {
        selectProjectStatusBarItem.text = `$(file-directory) ${
            selectedProject.languageName ?? "Unknown"
        }`;
    } else {
        selectProjectStatusBarItem.text = "";
    }

    selectProjectStatusBarItem.show();
}

export function deactivate() {}
