import * as fs from "fs";

import { Config } from "@/Files/Config/Config";
import { GrammarContribute } from "@/Files/Package/GrammarContribute";
import { LanguageContribute } from "@/Files/Package/LanguageContribute";

import * as ConfigUtils from "@/Files/Config/ConfigUtils";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as Paths from "@/Paths";
import * as PathUtils from "@/PathUtils";
import * as Strings from "@/Strings";

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

    const languageId: string = ConfigUtils.getLanguageId(config);

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
    let doesGrammarContributeExist: boolean = false;
    let doesLanguageContributeExist: boolean = false;

    packageJson.contributes.grammars = packageJson.contributes.grammars.map(
        (grammarContribute: GrammarContribute) => {
            if (grammarContribute.language === oldLanguageId) {
                doesGrammarContributeExist = true;
                return createGrammarContributeFromConfig(newConfig);
            }

            return grammarContribute;
        }
    );

    if (!doesGrammarContributeExist) {
        packageJson.contributes.grammars.push(
            createGrammarContributeFromConfig(newConfig)
        );
    }

    packageJson.contributes.languages = packageJson.contributes.languages.map(
        (languageContribute: LanguageContribute) => {
            if (
                languageContribute.id === oldLanguageId ||
                languageContribute.aliases.indexOf(oldConfig.languageName) !==
                    -1
            ) {
                doesLanguageContributeExist = true;
                return createLanguageContributeFromConfig(newConfig);
            }

            return languageContribute;
        }
    );

    if (!doesLanguageContributeExist) {
        packageJson.contributes.languages.push(
            createLanguageContributeFromConfig(newConfig)
        );
    }

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

function createGrammarContributeFromConfig(config: Config): GrammarContribute {
    let languageId: string = ConfigUtils.getLanguageId(config);

    return {
        language: languageId,
        path: PathUtils.getLanguageSyntaxPath(languageId, true),
        scopeName: Strings.scopeNamePrefix + languageId,
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
