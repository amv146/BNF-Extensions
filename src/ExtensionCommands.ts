import * as fs from "fs";
import * as path from "path";
import { window } from "vscode";

import * as BNFParser from "@/Files/BNFParser/BNFParser";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as ProjectUtils from "@/Files/ProjectUtils";
import * as InputUtils from "@/InputUtils";
import * as Strings from "@/Strings";
import * as TerminalUtils from "@/TerminalUtils";
import * as TokenUtils from "@/Tokens/TokenUtils";
import * as VSCodeUtils from "@/VSCodeUtils";
import { Config, ConfigGrammar } from "@/Files/Config/Config";
import { Project } from "@/Files/Project";

export async function buildGrammar(project: Project): Promise<void> {
    await TerminalUtils.executeCommand(
        "mkdir -p " + ProjectUtils.getBuildDirectory(project),
        ProjectUtils.getProjectDirectory(project)
    );

    await TerminalUtils.executeCommand(
        "bnfc -m --haskell " +
            ProjectUtils.getGrammarPath(project) +
            " && make",
        ProjectUtils.getBuildDirectory(project)
    );
}

export async function createConfigFile(
    file: string
): Promise<Project | undefined> {
    const selectedEntryPath: string =
        file || (await VSCodeUtils.getSelectedExplorerFileSystemEntry());

    if (FileSystemEntryUtils.isFile(selectedEntryPath)) {
        window.showErrorMessage(
            Strings.pleaseSelectADirectoryToCreateTheConfigFileIn
        );

        return;
    }

    const grammarFiles: string[] = await ProjectUtils.findGrammarFiles(
        selectedEntryPath
    );

    const mainGrammarPath: string | undefined =
        await InputUtils.promptForMainGrammarFile(grammarFiles);

    if (mainGrammarPath === undefined) {
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

    const configFilePath: string = path.join(
        selectedEntryPath,
        Strings.configFileName
    );

    const configFile: number = fs.openSync(configFilePath, "w");

    const config: Config = {
        $schema: Strings.configSchema,
        mainGrammarPath: mainGrammarPath
            ? path.relative(selectedEntryPath, mainGrammarPath)
            : undefined,
        languageName: languageName,
        fileExtensions: [languageFileExtension],
        grammar: mainGrammarPath
            ? TokenUtils.tokensToConfigGrammar(
                  await BNFParser.parseGrammarFile(mainGrammarPath)
              )
            : [],
    };

    FileSystemEntryUtils.writeJsonFile(configFile, config);

    const project: Project = ProjectUtils.create(configFilePath, config);

    return ProjectUtils.updateProject(project);
}

export async function parseGrammarFile(
    selectedProject: Project | undefined
): Promise<Project | undefined> {
    if (!selectedProject) {
        window.showErrorMessage(
            "Please enter into a project's directory to parse the main grammar file."
        );

        return undefined;
    }

    if (!selectedProject.mainGrammarPath) {
        window.showErrorMessage(
            "You need to specify a main grammar file in the config file to parse it."
        );

        return undefined;
    }

    const grammarPath: string | undefined = path.join(
        path.dirname(selectedProject.configPath),
        selectedProject.mainGrammarPath
    );

    const parsedConfigGrammar: ConfigGrammar[] =
        TokenUtils.tokensToConfigGrammar(
            await BNFParser.parseGrammarFile(grammarPath)
        );

    const { configPath, languageId, ...config } = selectedProject;

    config.grammar = parsedConfigGrammar;

    FileSystemEntryUtils.writeJsonFile(configPath, config);

    return ProjectUtils.updateProject(selectedProject);
}
