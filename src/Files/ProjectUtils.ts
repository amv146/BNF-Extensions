import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { window } from "vscode";

import * as ConfigUtils from "@/Files/Config/ConfigUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as LanguageConfigurationUtils from "@/Files/LanguageConfigurationUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as PathUtils from "@/Files/PathUtils";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as Strings from "@/Strings";
import * as TextmateUtils from "@/Textmate/TextmateUtils";
import { Config } from "@/Files/Config/Config";
import { LanguageConfigurationFile } from "@/Files/LanguageConfigurationFile";
import { Project } from "@/Files/Project";
import { TextmateFile } from "@/Textmate/TextmateFile";
import { Token } from "@/Tokens/Token";

export const enum DirectoryName {
    build = "build",
    grammar = "grammar",
    src = "src",
    test = "test",
}

export function configPathToLanguageId(configPath: string): string {
    return getLanguageId(fs.statSync(configPath).ino);
}

export function create(configPath: string, config: Config): Project {
    return {
        ...config,
        configPath,
        languageId: configPathToLanguageId(configPath),
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
        PathUtils.isPathInside(currentPath, getProjectDirectory(project))
    );

    return projects.sort((leftProject, rightProject) => {
        return (
            PathUtils.getDistanceBetweenPaths(
                currentPath,
                getProjectDirectory(leftProject)
            ) -
            PathUtils.getDistanceBetweenPaths(
                currentPath,
                getProjectDirectory(rightProject)
            )
        );
    });
}

export function getBuildDirectory(project: Project): string {
    return path.join(getProjectDirectory(project), DirectoryName.build);
}

export function getGrammarPath(project: Project): string {
    return path.join(
        getProjectDirectory(project),
        project.mainGrammarPath ?? ""
    );
}

export function getLanguageId(inode: number): string {
    return "" + inode;
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

export async function updateProject(
    project: Project
): Promise<Project | undefined> {
    const newProject: Project | undefined = await readConfigIntoProject(
        project.configPath
    );

    if (!newProject) {
        return undefined;
    }

    StorageUtils.addProject(newProject);
    updateProjectFiles(newProject);

    return newProject;
}

export async function updateProjectFiles(project: Project): Promise<void> {
    PackageUtils.updateContributesFromProjects([project]);

    const tokens: Token[] =
        ConfigUtils.generateTokensFromConfigGrammar(project);

    const textmateFile: TextmateFile = TextmateUtils.createTextmate(
        tokens,
        project.languageName,
        project.languageId
    );

    FileSystemEntryUtils.writeJsonFile(
        PathUtils.getLanguageSyntaxPath(project.languageId),
        textmateFile
    );

    const createLanguageConfigurationFile: boolean =
        project.options?.createLanguageConfigurationFile ?? false;

    if (createLanguageConfigurationFile) {
        const languageConfigurationFile: LanguageConfigurationFile =
            LanguageConfigurationUtils.generateLanguageConfigurationFile(
                tokens
            );

        FileSystemEntryUtils.writeJsonFile(
            PathUtils.getLanguageConfigurationPath(project.languageId),
            languageConfigurationFile
        );
    } else {
        FileSystemEntryUtils.deleteFile(
            PathUtils.getLanguageConfigurationPath(project.languageId)
        );
    }

    return window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: Strings.updatingProjectHighlighting,
            cancellable: false,
        },
        async () => {
            return;
        }
    );
}
