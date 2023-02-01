import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { workspace, window } from "vscode";

import * as ConfigUtils from "./Config/ConfigUtils";
import * as FileSystemEntryUtils from "./FileSystemEntryUtils";
import * as PackageUtils from "./Package/PackageUtils";
import * as Paths from "../Paths";
import * as Strings from "../Strings";
import * as TextmateUtils from "../Textmate/TextmateUtils";

import * as ConsoleUtils from "../ConsoleUtils";
import * as StorageUtils from "../Storage/StorageUtils";

import { Config } from "./Config/Config";
import * as VSCodeUtils from "../VSCodeUtils";

export const enum DirectoryName {
    build = "build",
    grammar = "grammar",
    src = "src",
    test = "test",
}

export class Project {
    private rootPath: string;
    private configPath: string;
    private grammarPath: string = "";
    private config: Promise<Config | undefined>;

    public constructor(configPath: string, config?: Config) {
        this.configPath = configPath;
        this.rootPath = path.dirname(configPath);

        this.config = config ? Promise.resolve(config) : this.readConfig();
    }

    public async getConfig(): Promise<Config | undefined> {
        return this.config;
    }

    public getConfigPath(): string {
        return this.configPath;
    }

    public getBuildDirectory(): string {
        return path.join(this.rootPath, DirectoryName.build);
    }

    public getGrammarDirectory(): string {
        return path.join(this.rootPath, DirectoryName.grammar);
    }

    public getGrammarPath(): string {
        return this.grammarPath;
    }

    public getProjectDirectory(): string {
        return this.rootPath;
    }

    public getSourceDirectory(): string {
        return path.join(this.rootPath, DirectoryName.src);
    }

    public getTestDirectory(): string {
        return path.join(this.rootPath, DirectoryName.test);
    }

    public async rewritePackageJson(): Promise<void> {
        const currentConfig: Config | undefined = await this.config;
        const tempConfig: Config | undefined = await this.readConfig();

        if (tempConfig === undefined || currentConfig === undefined) {
            return;
        }

        PackageUtils.updateContributesFromConfig(currentConfig, tempConfig);

        this.config = Promise.resolve(tempConfig);

        const textmateGrammar: string = TextmateUtils.generateTextmateJson(
            ConfigUtils.generateTokensFromConfigGrammar(tempConfig),
            tempConfig.languageName,
            ConfigUtils.getLanguageId(tempConfig)
        );

        fs.writeFile(
            Paths.getLanguageSyntaxPath(ConfigUtils.getLanguageId(tempConfig)),
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

    public static findTopMostProjects(rootPath: string): Project[] {
        let projects: Project[] = StorageUtils.getProjects();

        projects = projects.sort((a, b) => {
            return (
                Paths.getDistanceBetweenPaths(rootPath, a.getConfigPath()) -
                Paths.getDistanceBetweenPaths(rootPath, b.getConfigPath())
            );
        });

        return projects;
    }

    public static async findTopMostProjectsOld(
        rootPath: string,
        maxNumberOfProjects?: number
    ): Promise<Project[]> {
        return window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Loading project",
                cancellable: false,
            },
            async (progress, token) => {
                const projects: Project[] = [];
                const configPaths: string[] =
                    await FileSystemEntryUtils.findClosestFileSystemEntriesWithName(
                        rootPath,
                        Strings.configFileName,
                        maxNumberOfProjects
                    );

                for (const configPath of configPaths) {
                    const project: Project = new Project(configPath);
                    projects.push(project);
                }

                return projects;
            }
        );
    }

    public static findGrammarFiles(rootPath: string): Promise<string[]> {
        ConsoleUtils.log(rootPath.toString());
        return FileSystemEntryUtils.findClosestFilesWithExtension(
            rootPath,
            Strings.grammarFileExtension
        );
    }

    private async readConfig(): Promise<Config | undefined> {
        const config: Config | undefined =
            await FileSystemEntryUtils.readJsonFile<Config>(this.configPath);

        if (config === undefined) {
            window.showErrorMessage(
                "Error reading config file. Please check the file for errors."
            );

            return undefined;
        }

        this.grammarPath = path.join(
            this.rootPath,
            config.mainGrammarPath ?? ""
        );

        return config;
    }
}
