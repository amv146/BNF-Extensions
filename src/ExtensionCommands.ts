import * as path from "path";
import * as vscode from "vscode";
import { window, Uri } from "vscode";

import { Config } from "./Files/Config/Config";
import { Project } from "./Files/Project";
import * as BNFParser from "./Files/BNFParser/BNFParser";
import * as ConsoleUtils from "./ConsoleUtils";
import * as FileSystemEntryUtils from "./Files/FileSystemEntryUtils";
import * as InputUtils from "./InputUtils";
import * as PackageUtils from "./Files/Package/PackageUtils";
import * as Strings from "./Strings";
import * as TerminalUtils from "./TerminalUtils";
import * as VSCodeUtils from "./VSCodeUtils";

// export async function buildGrammar(project: Project): Promise<void> {
//     const projectPath =
//         await FileSystemEntryUtils.findTopMostFileSystemEntryWithName(
//             vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? "",
//             "config.bnf.json"
//         );

//     window.showInformationMessage(`Project directory: ${projectPath}`);

//     const grammarPath: string | undefined =
//         window.activeTextEditor?.document.uri.fsPath;

//     if (grammarPath === undefined) {
//         ConsoleUtils.log("No grammar file open");
//         window.showErrorMessage("No grammar file is open.");
//         return;
//     }

//     project = new Project(projectPath || "");

//     window.showInformationMessage(
//         (await project.getConfig()).languageName ?? ""
//     );

//     buildGrammarCommands(project);

//     const bnfTokens: Token[] = await BNFParser.parseBNFFile(grammarPath);

//     // const textmateGrammar: string = generateTextmateJson(
//     //     bnfTokens,
//     //     project.getLanguageName()
//     // );

//     // const grammarName: string = jsonObject.contributes;

//     // ConsoleUtils.log("Grammar name: " + grammarName);
// }

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
    const selectedEntryPath: string =
        await VSCodeUtils.getSelectedExplorerFileSystemEntry();

    const grammarFiles: string[] = await Project.findGrammarFiles(
        selectedEntryPath
    );

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
        grammar: [],
    };

    const configFilePath: string = path.join(
        selectedEntryPath,
        Strings.configFileName
    );

    FileSystemEntryUtils.writeJsonFile(configFilePath, config);

    PackageUtils.addContributesFromConfig(config);
}
