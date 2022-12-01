// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import { window, Uri } from "vscode";

import * as BNFParser from "./Files/BNFParser/BNFParser";
import * as ConsoleUtils from "./ConsoleUtils";
import * as FileSystemEntryUtils from "./Files/FileSystemEntryUtils";
import * as InputUtils from "./InputUtils";
import * as TerminalUtils from "./TerminalUtils";
import * as TextmateUtils from "./Textmate/TextmateUtils";
import * as VSCodeUtils from "./VSCodeUtils";
import { Project } from "./Files/Project";
import { Token } from "./Tokens/Token";
import * as Strings from "./Strings";
import { splitWords } from "./RegExpUtils";
import { Config } from "./Files/Config/Config";
import { configFileName } from "./Strings";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let project: Project;

export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let buildGrammarDisposable = vscode.commands.registerCommand(
        "bnf-extensions.buildGrammar",
        buildGrammar
    );

    let createConfigFileDisposable = vscode.commands.registerCommand(
        "bnf-extensions.createConfigFile",
        createConfigFile
    );

    project = Project.findTopMostProject(
        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
    );

    context.subscriptions.push(buildGrammarDisposable);
    context.subscriptions.push(createConfigFileDisposable);
}

export async function buildGrammar(): Promise<void> {
    const projectPath =
        await FileSystemEntryUtils.findTopMostFileSystemEntryWithName(
            vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? "",
            "config.bnf.json"
        );

    window.showInformationMessage(`Project directory: ${projectPath}`);

    const grammarPath: string | undefined =
        window.activeTextEditor?.document.uri.fsPath;

    if (grammarPath === undefined) {
        ConsoleUtils.log("No grammar file open");
        window.showErrorMessage("No grammar file is open.");
        return;
    }

    project = new Project(projectPath || "");

    window.showInformationMessage(
        (await project.getConfig()).languageName ?? ""
    );

    buildGrammarCommands(project);

    const bnfTokens: Token[] = await BNFParser.parseBNFFile(grammarPath);

    // const textmateGrammar: string = generateTextmateJson(
    //     bnfTokens,
    //     project.getLanguageName()
    // );

    const grammarName: string = jsonObject.contributes;

    ConsoleUtils.log("Grammar name: " + grammarName);
}

export async function buildGrammarCommands(project: Project): Promise<void> {
    await TerminalUtils.executeCommand(
        "mkdir -p " + project.getBuildDirectory(),
        project.getProjectDirectory()
    );

    await TerminalUtils.executeCommand(
        "bnfc -m --haskell " + project.getGrammarPath() + " && make",
        project.getBuildDirectory()
    );
}

export async function createConfigFile(): Promise<void> {
    let selectedEntryPath: string =
        await VSCodeUtils.getSelectedExplorerFileSystemEntry();

    const grammarFiles: string[] = Project.findGrammarFiles(selectedEntryPath);

    const mainGrammarPath: string | undefined =
        await InputUtils.promptForMainGrammarFile(grammarFiles);

    if (!mainGrammarPath) {
        return;
    }

    const languageName: string | undefined =
        await InputUtils.promptForLanguageName();

    if (!languageName) {
        return;
    }

    const languageFileExtension: string | undefined =
        await InputUtils.promptForFileExtension();

    if (!languageFileExtension) {
        return;
    }

    const config: Config = {
        mainGrammarPath: path.relative(selectedEntryPath, mainGrammarPath),
        languageName: languageName,
        fileExtensions: [languageFileExtension],
        grammar: [{}],
    };

    const configFilePath: string = path.join(selectedEntryPath, configFileName);

    FileSystemEntryUtils.writeJsonFile(configFilePath, config);

    window.showInformationMessage(
        "" + mainGrammarPath + " " + languageName + " " + languageFileExtension
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
