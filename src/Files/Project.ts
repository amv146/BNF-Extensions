import * as path from "path";

import * as RegExpUtils from "../RegExpUtils";
import { Config } from "./Config/Config";
import * as FileSystemEntryUtils from "./FileSystemEntryUtils";
import * as Strings from "../Strings";

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
    private config: Promise<Config>;

    public constructor(configPath: string) {
        this.configPath = configPath;
        this.rootPath = path.dirname(configPath);

        this.config = this.readConfig();
    }

    public async getConfig(): Promise<Config> {
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

    public static findTopMostProject(rootPath: string): Project {
        const configPath =
            FileSystemEntryUtils.findTopMostFileSystemEntryWithName(
                rootPath,
                Strings.configFileName
            ) ?? "";

        return new Project(configPath);
    }

    public static findGrammarFiles(rootPath: string): string[] {
        return FileSystemEntryUtils.findClosestFilesWithExtension(
            rootPath,
            Strings.grammarFileExtension
        );
    }

    private async readConfig(): Promise<Config> {
        return await FileSystemEntryUtils.readJsonFile<Config>(this.configPath);
    }
}
