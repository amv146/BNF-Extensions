import * as FileUtils from "./FileUtils";
import * as vscode from "vscode";

export class ProjectDirectory {
    private rootDirectory: string;
    private grammarPath: string;

    public constructor(grammarPath: string) {
        this.grammarPath = grammarPath;

        if (this.isGrammarInGrammarParentFolder(grammarPath)) {
            this.rootDirectory = FileUtils.getFolderAbove(grammarPath, 2, true);
        } else {
            this.rootDirectory = FileUtils.getFolderAbove(grammarPath, 1, true);
        }
    }

    private isGrammarInGrammarParentFolder(grammarPath: string): boolean {
        return FileUtils.getFolderAbove(grammarPath, 1) === "grammar";
    }

    public getBuildDirectory(): string {
        return this.rootDirectory + "/build";
    }

    public getProjectDirectory(): string {
        return this.rootDirectory;
    }

    public getGrammarDirectory(): string {
        return this.rootDirectory + "/grammar";
    }

    public getGrammarPath(): string {
        return this.grammarPath;
    }

    public getSourceDirectory(): string {
        return this.rootDirectory + "/src";
    }

    public getTestDirectory(): string {
        return this.rootDirectory + "/test";
    }
}
