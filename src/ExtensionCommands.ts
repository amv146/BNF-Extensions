import * as path from "path";
import * as vscode from "vscode";
import { window, Uri } from "vscode";

import { Config } from "@/Files/Config/Config";
import { Project } from "@/Files/Project";
import * as BNFParser from "@/Files/BNFParser/BNFParser";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as InputUtils from "@/InputUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as Strings from "@/Strings";
import * as TerminalUtils from "@/TerminalUtils";
import * as VSCodeUtils from "@/VSCodeUtils";
import { log } from "@/ConsoleUtils";
import { rootPath } from "@/Paths";
import { addProject } from "@/Storage/StorageUtils";

export async function buildGrammar(project: Project): Promise<void> {
    await TerminalUtils.executeCommand(
        "mkdir -p " + project.getBuildDirectory(),
        project.getProjectDirectory()
    );

    await TerminalUtils.executeCommand(
        "bnfc -m --haskell " + project.getGrammarPath() + " && make",
        project.getBuildDirectory()
    );
}

export async function createConfigFile(
    file: string
): Promise<Project | undefined> {
    let selectedEntryPath: string =
        file || (await VSCodeUtils.getSelectedExplorerFileSystemEntry());

    if (FileSystemEntryUtils.isFile(selectedEntryPath)) {
        window.showErrorMessage(
            "Please select a directory to create the config file in."
        );

        return;
    }

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
        $schema: Strings.configSchema,
        mainGrammarPath: path.relative(selectedEntryPath, mainGrammarPath),
        languageName: languageName,
        fileExtensions: [languageFileExtension],
        grammar: [],
    };

    const configFilePath: string = path.join(
        selectedEntryPath,
        Strings.configFileName
    );

    const project: Project = new Project(configFilePath, config);
    addProject(project);

    FileSystemEntryUtils.writeJsonFile(configFilePath, config);

    PackageUtils.addContributesFromConfig(config);

    return project;
}
