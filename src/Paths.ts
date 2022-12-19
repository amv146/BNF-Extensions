import * as appRoot from "app-root-path";
import * as path from "path";

import * as Strings from "./Strings";

export const packageJsonPath: string = appRoot.path + "/package.json";
export const rootPath: string = appRoot.path;
export const absoluteSyntaxesPath: string = rootPath + "/languages/syntaxes/";
export const relativeSyntaxesPath: string = "./languages/syntaxes/";

export function isPathInside(childPath: string, parentPath: string): boolean {
    childPath = path.normalize(childPath);
    parentPath = path.normalize(parentPath);

    if (!parentPath.endsWith(path.sep)) {
        parentPath += path.sep;
    }

    if (childPath.length < parentPath.length) {
        return false;
    }

    return childPath.startsWith(parentPath);
}

export function getDistanceToDirectory(
    childPath: string,
    directoryPath: string
): number {
    childPath = path.normalize(childPath);
    directoryPath = path.normalize(directoryPath);

    return (
        childPath.split(path.sep).length - directoryPath.split(path.sep).length
    );
}

export const getLanguageSyntaxPath = (
    languageId: string,
    relative: boolean = false
): string => {
    return path.join(
        relative ? relativeSyntaxesPath : absoluteSyntaxesPath,
        languageId + Strings.textmateGrammarFileExtension
    );
};
