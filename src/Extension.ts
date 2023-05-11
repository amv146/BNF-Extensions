import * as path from "path";
import * as vscode from "vscode";

import * as ExtensionCommands from "@/ExtensionCommands";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as ProjectUtils from "@/Files/ProjectUtils";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as Strings from "@/Strings";
import { Project } from "@/Files/Project";

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

    const createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        async (file) => {
            selectedProject = await ExtensionCommands.createConfigFile(
                file?.fsPath
            );
        }
    );

    const parseBNFFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.parseGrammarFile",
        async () => {
            selectedProject = await ExtensionCommands.parseGrammarFile(
                selectedProject
            );
        }
    );

    context.subscriptions.push(createConfigFileDisposable);
    context.subscriptions.push(parseBNFFileDisposable);

    registerUpdateStatusBarItemOnEditorChange();
    registerOnSaveConfigFile();
    registerOnDeleteConfigFile();

    updateSelectedProjectStatusBarItem();
}

function registerOnSaveConfigFile(): void {
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (path.basename(document.fileName) !== Strings.configFileName) {
            return;
        }

        /**
         * If a project is currently selected, check if the saved file is the config file of the selected project.
         */
        if (selectedProject) {
            const currentProjectLanguageId: string = selectedProject.languageId;

            const languageId: string = ProjectUtils.configPathToLanguageId(
                document.fileName
            );

            if (currentProjectLanguageId !== languageId) {
                const projects: Project[] = ProjectUtils.findTopMostProjects(
                    document.fileName
                );

                const newSelectedProject: Project | undefined = projects.find(
                    (project) => project.languageId === languageId
                );

                selectedProject =
                    newSelectedProject ||
                    (await ProjectUtils.readConfigIntoProject(
                        document.fileName
                    )) ||
                    projects[0];
            }
        } else {
            selectedProject = await ProjectUtils.readConfigIntoProject(
                document.fileName
            );
        }

        selectedProject = selectedProject
            ? await ProjectUtils.updateProject(selectedProject)
            : undefined;

        updateSelectedProjectStatusBarItem();
    });
}

/**
 * When files are deleted, this function will be called.
 * If the deleted file is a `config.bnf.json` file, the function will check if one of the deleted files is the config file of the selected project.
 * If so, select the next closest project.
 * If not, do nothing.
 *
 * Additionally, the function will remove the deleted project(s) from the storage.
 */
function registerOnDeleteConfigFile(): void {
    vscode.workspace.onWillDeleteFiles(async (event) => {
        /**
         * Deleted `config.bnf.json` files.
         */
        const deletedConfigFilePaths: string[] = event.files
            .map((file) => file.fsPath)
            .filter(
                (filePath) => path.basename(filePath) === Strings.configFileName
            );

        if (deletedConfigFilePaths.length === 0) {
            return;
        }

        const deletedLanguageIds: string[] = deletedConfigFilePaths.map(
            (filePath) => ProjectUtils.configPathToLanguageId(filePath)
        );

        /**
         * If a project is currently selected, check if the deleted file is the config file of the selected project.
         * If so, select the next closest project.
         * If not, do nothing.
         */
        if (selectedProject) {
            if (deletedLanguageIds.includes(selectedProject.languageId)) {
                const projects: Project[] = ProjectUtils.findTopMostProjects(
                    vscode.window.activeTextEditor?.document.fileName || ""
                );

                selectedProject = projects[0];
            }
        }

        const newProjects: Project[] = StorageUtils.getProjects().filter(
            (project) => !deletedLanguageIds.includes(project.languageId)
        );

        StorageUtils.setProjects(newProjects);
        PackageUtils.updateContributesFromProjects(newProjects);
        updateSelectedProjectStatusBarItem();
    });
}

function registerUpdateStatusBarItemOnEditorChange() {
    vscode.window.onDidChangeActiveTextEditor(async (event) => {
        if (!event) {
            return;
        }

        const projects: Project[] = ProjectUtils.findTopMostProjects(
            event.document.fileName
        );

        selectedProject = projects[0];

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
