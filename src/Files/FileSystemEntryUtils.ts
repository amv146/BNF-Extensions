import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { Uri } from "vscode";
import * as ConsoleUtils from "../ConsoleUtils";

export async function readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, "utf8");
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
    const fileContent = await readFile(filePath);

    ConsoleUtils.log("File content: " + fileContent);

    return JSON.parse(fileContent);
}

export async function readFileLines(filePath: string): Promise<string[]> {
    const inStream = fs.createReadStream(filePath);
    const readLineInterface = readline.createInterface(inStream);

    let lines: string[] = [];

    for await (const line of readLineInterface) {
        lines.push(line);
    }

    return lines;
}

export function getLocationInPath(
    path: string,
    numAbove: number,
    fullPath: boolean = false
) {
    return getPathArray(path)
        .slice(
            fullPath ? 0 : -numAbove - 1,
            numAbove > 0 ? -numAbove : undefined
        )
        .join("/");
}

export function getPathArray(path: string): string[] {
    return path.split("/");
}

export function findTopMostFileSystemEntryWithName(
    startPath: string,
    fileSystemEntryName: string
): string | undefined {
    if (!fs.existsSync(startPath)) {
        return undefined;
    }

    const fileSystemEntries: string[] = fs.readdirSync(startPath);

    for (const traversedFileSystemEntryName of fileSystemEntries) {
        if (traversedFileSystemEntryName === fileSystemEntryName) {
            return path.join(startPath, fileSystemEntryName);
        }

        const traversedFileSystemEntryPath = path.join(
            startPath,
            traversedFileSystemEntryName
        );

        if (fs.statSync(traversedFileSystemEntryPath).isDirectory()) {
            const result: string | undefined =
                findTopMostFileSystemEntryWithName(
                    traversedFileSystemEntryPath,
                    fileSystemEntryName
                );

            if (result) {
                return result;
            }
        }
    }
}

export function findClosestFilesWithExtension(
    startPath: string,
    fileExtension: string,
    maxNumberOfMatches: number = 0
): string[] {
    let matches: string[] = [];

    if (!fs.existsSync(startPath)) {
        return matches;
    }

    const fileSystemEntries: string[] = fs.readdirSync(startPath);

    const fileNames: string[] = fileSystemEntries.filter((fileSystemEntry) =>
        fs.lstatSync(path.join(startPath, fileSystemEntry)).isFile()
    );

    const directories: string[] = fileSystemEntries.filter((fileSystemEntry) =>
        fs.lstatSync(path.join(startPath, fileSystemEntry)).isDirectory()
    );

    for (const fileName of fileNames) {
        if (maxNumberOfMatches > 0 && matches.length >= maxNumberOfMatches) {
            return matches.slice(0, maxNumberOfMatches);
        }

        const filePath = path.join(startPath, fileName);

        if (fileName.endsWith(fileExtension)) {
            matches.push(filePath);
        }
    }

    for (const directory of directories) {
        if (maxNumberOfMatches > 0 && matches.length >= maxNumberOfMatches) {
            return matches.slice(0, maxNumberOfMatches);
        }

        const directoryPath = path.join(startPath, directory);

        matches = matches.concat(
            findClosestFilesWithExtension(
                directoryPath,
                fileExtension,
                maxNumberOfMatches
            )
        );
    }

    return maxNumberOfMatches > 0
        ? matches.slice(0, maxNumberOfMatches)
        : matches;
}

export function writeJsonFile(filePath: string, content: any): void {
    fs.writeFile(filePath, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            ConsoleUtils.log("" + err);
        }
    });
}
