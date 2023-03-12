import { window } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { Config } from "@/Files/Config/Config";
import { Project } from "@/Files/Project";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as ConfigUtils from "@/Files/Config/ConfigUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as PathUtils from "@/Files/PathUtils";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as Strings from "@/Strings";
import * as TextmateUtils from "@/Textmate/TextmateUtils";

export const enum DirectoryName {
    build = "build",
    grammar = "grammar",
    src = "src",
    test = "test",
}

export function create(configPath: string, config: Config): Project {
    return {
        ...config,
        configPath,
        languageId: getLanguageId(fs.statSync(configPath).ino),
    };
}

export function findGrammarFiles(rootPath: string): Promise<string[]> {
    return FileSystemEntryUtils.findClosestFilesWithExtension(
        rootPath,
        Strings.grammarFileExtension
    );
}

export function findTopMostProjects(currentPath: string): Project[] {
    const projects: Project[] = StorageUtils.getProjects().filter((project) =>
        PathUtils.isPathInside(currentPath, path.dirname(project.configPath))
    );

    return projects.sort((a, b) => {
        const distance: number =
            PathUtils.getDistanceBetweenPaths(
                currentPath,
                path.dirname(a.configPath)
            ) -
            PathUtils.getDistanceBetweenPaths(
                currentPath,
                path.dirname(b.configPath)
            );

        console.log(distance);

        return distance;
    });
}

export function getBuildDirectory(project: Project): string {
    return path.join(getProjectDirectory(project), DirectoryName.build);
}

export function getGrammarDirectory(project: Project): string {
    return path.join(getProjectDirectory(project), DirectoryName.grammar);
}

export function getGrammarPath(project: Project): string {
    return path.join(
        getProjectDirectory(project),
        project.mainGrammarPath ?? ""
    );
}

export function getLanguageId(inode: number): string {
    return "" + (inode ?? "0");
}

export function getProjectDirectory(project: Project): string {
    return path.dirname(project.configPath);
}

export async function readConfigIntoProject(
    configPath: string
): Promise<Project | undefined> {
    const config: Config | undefined =
        await FileSystemEntryUtils.readJsonFile<Config>(configPath);

    if (!config) {
        window.showErrorMessage(
            Strings.errorReadingConfigFilePleaseCheckTheFileForErrors
        );

        return undefined;
    } else {
        return create(configPath, config);
    }
}

export async function rewritePackageJson(project: Project): Promise<void> {
    const newProject: Project | undefined = await readConfigIntoProject(
        project.configPath
    );

    if (!newProject) {
        return;
    }

    PackageUtils.updateContributesFromProject(newProject);

    const textmateGrammar: string = TextmateUtils.generateTextmateJson(
        ConfigUtils.generateTokensFromConfigGrammar(newProject),
        newProject.languageName,
        newProject.languageId
    );

    fs.writeFile(
        PathUtils.getLanguageSyntaxPath(newProject.languageId),
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
