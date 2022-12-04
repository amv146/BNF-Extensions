import * as fs from "fs";
import * as path from "path";

import * as ConfigUtils from "../Config/ConfigUtils";
import { GrammarContribute } from "./GrammarContribute";
import { LanguageContribute } from "./LanguageContribute";
import { Config } from "../Config/Config";
import * as Strings from "../../Strings";

let packageJson = require("../../../package.json");

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

    fs.writeFileSync(
        path.join(__dirname, "../../../package.json"),
        JSON.stringify(packageJson, null, 4),
        "utf8"
    );
}

function createLanguageContributeFromConfig(
    config: Config
): LanguageContribute {
    let languageId: string = ConfigUtils.getLanguageId(config);

    return {
        aliases: [languageId, config.languageName],
        id: languageId,
        extensions: config.fileExtensions,
    };
}

function createGrammarContributeFromConfig(config: Config): GrammarContribute {
    return {
        language: config.languageName,
        scopeName: Strings.scopeNamePrefix + ConfigUtils.getLanguageId(config),
        path: path.join(
            Strings.syntaxesPath,
            config.languageName + Strings.textmateGrammarFileExtension
        ),
    };
}
