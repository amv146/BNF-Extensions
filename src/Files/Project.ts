import { window } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { Config } from "@/Files/Config/Config";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as ConfigUtils from "@/Files/Config/ConfigUtils";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as PackageUtils from "@/Files/Package/PackageUtils";
import * as Paths from "@/Paths";
import * as PathUtils from "@/PathUtils";
import * as StorageUtils from "@/Storage/StorageUtils";
import * as Strings from "@/Strings";
import * as TextmateUtils from "@/Textmate/TextmateUtils";

export const enum DirectoryName {
    build = "build",
    grammar = "grammar",
    src = "src",
    test = "test",
}

export class Project {
    private config: Promise<Config | undefined>;
    private configPath: string;
    private grammarPath: string = "";
    private projectPath: string;

    public constructor(configPath: string, config?: Config) {
        this.configPath = configPath;
        this.projectPath = path.dirname(configPath);

        this.config = config ? Promise.resolve(config) : this.readConfig();
    }

    public async getConfig(): Promise<Config | undefined> {
        return this.config;
    }

    public getConfigPath(): string {
        return this.configPath;
    }

    public getBuildDirectory(): string {
        return path.join(this.projectPath, DirectoryName.build);
    }

    public getGrammarDirectory(): string {
        return path.join(this.projectPath, DirectoryName.grammar);
    }

    public getGrammarPath(): string {
        return this.grammarPath;
    }

    public getProjectDirectory(): string {
        return this.projectPath;
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
            PathUtils.getLanguageSyntaxPath(
                ConfigUtils.getLanguageId(tempConfig)
            ),
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

    public static findTopMostProjects(path: string): Project[] {
        let projects: Project[] = StorageUtils.getProjects();

        projects = projects.sort((a, b) => {
            return (
                PathUtils.getDistanceBetweenPaths(path, a.getConfigPath()) -
                PathUtils.getDistanceBetweenPaths(path, b.getConfigPath())
            );
        });

        return projects;
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
            this.projectPath,
            config.mainGrammarPath ?? ""
        );

        return config;
    }
}
