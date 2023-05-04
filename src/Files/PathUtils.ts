import * as path from "path";

import * as Paths from "@/Files/Paths";
import * as Strings from "@/Strings";

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

export function findClosestCommonDirectory(
    path1: string,
    path2: string
): string {
    path1 = path.normalize(path1);
    path2 = path.normalize(path2);

    const path1Parts: string[] = path1.split(path.sep);
    const path2Parts: string[] = path2.split(path.sep);

    let commonPath: string = "";

    for (let i = 0; i < path1Parts.length; ++i) {
        if (path1Parts[i] === path2Parts[i]) {
            commonPath += path1Parts[i] + path.sep;
        } else {
            break;
        }
    }

    return path.normalize(commonPath);
}

export function getDistanceBetweenPaths(path1: string, path2: string): number {
    path1 = path.normalize(path1);
    path2 = path.normalize(path2);

    if (!isPathInside(path1, path2)) {
        return -1;
    }

    const closestCommonDirectory: string = findClosestCommonDirectory(
        path1,
        path2
    );

    const path1PartsAfterCommonDirectory = path1
        .slice(
            path1.indexOf(closestCommonDirectory) +
                closestCommonDirectory.length
        )
        .split(path.sep);

    const path2PartsAfterCommonDirectory = path2
        .slice(
            path2.indexOf(closestCommonDirectory) +
                closestCommonDirectory.length
        )
        .split(path.sep);

    return (
        path1PartsAfterCommonDirectory.length +
        path2PartsAfterCommonDirectory.length
    );
}

export const getLanguageConfigurationPath = (
    languageId: string,
    relative: boolean = false
): string =>
    path.join(
        relative
            ? Paths.relativeLanguageConfigurationsPath
            : Paths.absoluteLanguageConfigurationsPath,
        languageId + Strings.languageConfigurationFileExtension
    );

export const getLanguageSyntaxPath = (
    languageId: string,
    relative: boolean = false
): string =>
    path.join(
        relative ? Paths.relativeSyntaxesPath : Paths.absoluteSyntaxesPath,
        languageId + Strings.languageSyntaxFileExtension
    );
