import * as fs from "fs";
import * as path from "path";
import { workspace, window } from "vscode";

import * as ConfigUtils from "./Config/ConfigUtils";
import * as FileSystemEntryUtils from "./FileSystemEntryUtils";
import * as PackageUtils from "./Package/PackageUtils";
import * as Paths from "../Paths";
import * as Strings from "../Strings";
import * as TextmateUtils from "../Textmate/TextmateUtils";
import { Config } from "./Config/Config";
import { Token } from "../Tokens/Token";
import { log } from "../ConsoleUtils";
import { parseBNFFile } from "./BNFParser/BNFParser";

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

    public constructor(configPath: string) {
        this.configPath = configPath;
        this.rootPath = path.dirname(configPath);

        this.config = this.readConfig();

        workspace.onDidSaveTextDocument(async (document) => {
            if (document.fileName === this.configPath) {
                const currentConfig: Config | undefined = await this.config;
                const tempConfig: Config | undefined = await this.readConfig();

                if (tempConfig === undefined || currentConfig === undefined) {
                    return;
                }

                PackageUtils.updateContributesFromConfig(
                    currentConfig,
                    tempConfig
                );

                this.config = Promise.resolve(tempConfig);

                const textmateGrammar: string =
                    TextmateUtils.generateTextmateJson(
                        ConfigUtils.generateTokensFromConfigGrammar(tempConfig),
                        tempConfig.languageName,
                        ConfigUtils.getLanguageId(tempConfig)
                    );

                fs.writeFile(
                    Paths.getLanguageSyntaxPath(
                        ConfigUtils.getLanguageId(tempConfig)
                    ),
                    textmateGrammar,
                    (err) => {
                        if (err) {
                            log(err.message);
                        }
                    }
                );
            }
        });
    }

    public async getConfig(): Promise<Config | undefined> {
        return await this.config;
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

    public static async findTopMostProject(rootPath: string): Promise<Project> {
        const configPath =
            (await FileSystemEntryUtils.findTopMostFileSystemEntryWithName(
                rootPath,
                Strings.configFileName
            )) ?? "";

        const newProject: Project = new Project(configPath);
        const grammarPath: string | undefined = (await newProject.getConfig())
            ?.mainGrammarPath;

        if (grammarPath) {
            parseBNFFile(
                path.join(newProject.getProjectDirectory(), grammarPath)
            );
        }

        return newProject;
    }

    public static findGrammarFiles(rootPath: string): Promise<string[]> {
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
