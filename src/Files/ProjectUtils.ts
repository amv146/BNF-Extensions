import { window } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { Config } from "@/Files/Config/Config";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as ConfigUtils from "@/Files/Config/ConfigUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as PathUtils from "@/PathUtils";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as Strings from "@/Strings";
import * as TextmateUtils from "@/Textmate/TextmateUtils";
import { Project } from "@/Files/Project";

export const enum DirectoryName {
    build = "build",
    grammar = "grammar",
    src = "src",
    test = "test",
}

export function create(configPath: string, config?: Config) {
    return {
        config: config ? Promise.resolve(config) : readConfig(configPath),
        configPath,
        inode: fs.statSync(configPath).ino,
    };
}

export function findGrammarFiles(rootPath: string): Promise<string[]> {
    ConsoleUtils.log(rootPath.toString());
    return FileSystemEntryUtils.findClosestFilesWithExtension(
        rootPath,
        Strings.grammarFileExtension
    );
}

export function findTopMostProjects(path: string): Project[] {
    let projects: Project[] = StorageUtils.getProjects();

    projects = projects.sort((a, b) => {
        return (
            PathUtils.getDistanceBetweenPaths(path, getConfigPath(a)) -
            PathUtils.getDistanceBetweenPaths(path, getConfigPath(b))
        );
    });

    return projects;
}

export function getBuildDirectory(project: Project): string {
    return path.join(getProjectDirectory(project), DirectoryName.build);
}

export async function getConfig(project: Project): Promise<Config | undefined> {
    return project.config;
}

export function getConfigPath(project: Project): string {
    return project.configPath;
}

export function getGrammarDirectory(project: Project): string {
    return path.join(getProjectDirectory(project), DirectoryName.grammar);
}

export async function getGrammarPath(project: Project): Promise<string> {
    const config: Config | undefined = await getConfig(project);

    return path.join(
        getProjectDirectory(project),
        config?.mainGrammarPath ?? ""
    );
}

export async function getInode(project: Project): Promise<number | undefined> {
    return (await project.config)?.inode;
}

export function getProjectDirectory(project: Project): string {
    return path.dirname(project.configPath);
}

export async function readConfig(
    configPath: string
): Promise<Config | undefined> {
    const config: Config | undefined =
        await FileSystemEntryUtils.readJsonFile<Config>(configPath);

    if (config === undefined) {
        window.showErrorMessage(
            "Error reading config file. Please check the file for errors."
        );

        return undefined;
    } else {
        config.path = configPath;
        config.inode = fs.statSync(configPath).ino;
    }

    return config;
}

export async function rewritePackageJson(project: Project): Promise<void> {
    const currentConfig: Config | undefined = await project.config;
    const newConfig: Config | undefined = await readConfig(project.configPath);

    if (!newConfig || !currentConfig) {
        return;
    }

    PackageUtils.updateContributesFromConfig(currentConfig, newConfig);

    project.config = Promise.resolve(newConfig);

    const textmateGrammar: string = TextmateUtils.generateTextmateJson(
        ConfigUtils.generateTokensFromConfigGrammar(newConfig),
        newConfig.languageName,
        ConfigUtils.getLanguageId(newConfig)
    );

    fs.writeFile(
        PathUtils.getLanguageSyntaxPath(ConfigUtils.getLanguageId(newConfig)),
        textmateGrammar,
        (err) => {
            if (err) {
                ConsoleUtils.log(err.message);
            }
        }
    );

    return window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Updating project highlighting",
            cancellable: false,
        },
        async (progress, token) => {}
    );
}
