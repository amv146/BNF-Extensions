import * as appRoot from "app-root-path";
import * as path from "path";

import * as Strings from "./Strings";

export const packageJsonPath: string = appRoot.path + "/package.json";
export const rootPath: string = appRoot.path;
export const absoluteSyntaxesPath: string = rootPath + "/languages/syntaxes/";
export const relativeSyntaxesPath: string = "./languages/syntaxes/";

export const getLanguageSyntaxPath = (
    languageId: string,
    relative: boolean = false
): string => {
    return path.join(
        relative ? relativeSyntaxesPath : absoluteSyntaxesPath,
        languageId + Strings.textmateGrammarFileExtension
    );
};
