import * as fs from "fs";
import * as path from "path";

import * as ConfigUtils from "../Config/ConfigUtils";
import * as ConsoleUtils from "../../ConsoleUtils";
import * as Paths from "../../Paths";
import * as Strings from "../../Strings";
import { Config } from "../Config/Config";
import { GrammarContribute } from "./GrammarContribute";
import { LanguageContribute } from "./LanguageContribute";

let packageJson = require(Paths.packageJsonPath);

export function addContributesFromConfig(config: Config): void {
    if (!packageJson.contributes) {
        packageJson.contributes = {};
    }

    if (!packageJson.contributes.grammars) {
        packageJson.contributes.grammars = [];
    }

    if (!packageJson.contributes.languages) {
        packageJson.contributes.languages = [];
    }

    packageJson.contributes.grammars.push(
        createGrammarContributeFromConfig(config)
    );

    packageJson.contributes.languages.push(
        createLanguageContributeFromConfig(config)
    );

    ConsoleUtils.log(JSON.stringify(packageJson, null, 4));

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

export function removeContributesFromConfig(config: Config): void {
    if (
        !packageJson.contributes ||
        !packageJson.contributes.grammars ||
        !packageJson.contributes.languages
    ) {
        return;
    }

    let languageId: string = ConfigUtils.getLanguageId(config);

    packageJson.contributes.grammars = packageJson.contributes.grammars.filter(
        (grammarContribute: GrammarContribute) => {
            return (
                grammarContribute.language !== languageId &&
                grammarContribute.scopeName !==
                    Strings.scopeNamePrefix + languageId
            );
        }
    );

    packageJson.contributes.languages =
        packageJson.contributes.languages.filter(
            (languageContribute: LanguageContribute) => {
                return (
                    languageContribute.id !== languageId &&
                    languageContribute.aliases.indexOf(config.languageName) ===
                        -1
                );
            }
        );

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

export function updateContributesFromConfig(
    oldConfig: Config,
    newConfig: Config
): void {
    if (
        !packageJson.contributes ||
        !packageJson.contributes.grammars ||
        !packageJson.contributes.languages
    ) {
        return;
    }

    let oldLanguageId: string = ConfigUtils.getLanguageId(oldConfig);

    packageJson.contributes.grammars = packageJson.contributes.grammars.map(
        (grammarContribute: GrammarContribute) => {
            if (
                grammarContribute.language === oldLanguageId ||
                grammarContribute.scopeName ===
                    Strings.scopeNamePrefix + oldLanguageId
            ) {
                return createGrammarContributeFromConfig(newConfig);
            }

            return grammarContribute;
        }
    );

    packageJson.contributes.languages = packageJson.contributes.languages.map(
        (languageContribute: LanguageContribute) => {
            if (
                languageContribute.id === oldLanguageId ||
                languageContribute.aliases.indexOf(oldConfig.languageName) !==
                    -1
            ) {
                return createLanguageContributeFromConfig(newConfig);
            }

            return languageContribute;
        }
    );

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

function createGrammarContributeFromConfig(config: Config): GrammarContribute {
    let languageId: string = ConfigUtils.getLanguageId(config);

    return {
        language: languageId,
        scopeName: Strings.scopeNamePrefix + languageId,
        path: Paths.getLanguageSyntaxPath(languageId, true),
    };
}

function createLanguageContributeFromConfig(
    config: Config
): LanguageContribute {
    let languageId: string = ConfigUtils.getLanguageId(config);

    return {
        aliases: [config.languageName, languageId],
        id: languageId,
        extensions: config.fileExtensions,
    };
}
