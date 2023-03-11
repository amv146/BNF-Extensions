import * as fs from "fs";

import { Project } from "@/Files/Project";
import { GrammarContribute } from "@/Files/Package/GrammarContribute";
import { LanguageContribute } from "@/Files/Package/LanguageContribute";

import * as ProjectUtils from "@/Files/ProjectUtils";
import * as ConsoleUtils from "@/ConsoleUtils";
import * as Paths from "@/Paths";
import * as PathUtils from "@/PathUtils";
import * as Strings from "@/Strings";

let packageJson = require(Paths.packageJsonPath);

export function addContributesFromProject(project: Project): void {
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
        createGrammarContributeFromProject(project)
    );

    packageJson.contributes.languages.push(
        createLanguageContributeFromProject(project)
    );

    ConsoleUtils.log(JSON.stringify(packageJson, null, 4));

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

export function removeContributesFromProject(project: Project): void {
    if (
        !packageJson.contributes ||
        !packageJson.contributes.grammars ||
        !packageJson.contributes.languages
    ) {
        return;
    }

    const languageId: string = ProjectUtils.getLanguageId(project);

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
                    languageContribute.aliases.indexOf(project.languageName) ===
                        -1
                );
            }
        );

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

export function updateContributesFromProject(
    oldProject: Project,
    newProject: Project
): void {
    if (
        !packageJson.contributes ||
        !packageJson.contributes.grammars ||
        !packageJson.contributes.languages
    ) {
        return;
    }

    const languageId: string = ProjectUtils.getLanguageId(oldProject);
    let doesGrammarContributeExist: boolean = false;
    let doesLanguageContributeExist: boolean = false;

    packageJson.contributes.grammars = packageJson.contributes.grammars.map(
        (grammarContribute: GrammarContribute) => {
            if (grammarContribute.language === languageId) {
                doesGrammarContributeExist = true;

                return createGrammarContributeFromProject(newProject);
            }

            return grammarContribute;
        }
    );

    if (!doesGrammarContributeExist) {
        packageJson.contributes.grammars.push(
            createGrammarContributeFromProject(newProject)
        );
    }

    packageJson.contributes.languages = packageJson.contributes.languages.map(
        (languageContribute: LanguageContribute) => {
            if (languageContribute.id === languageId) {
                doesLanguageContributeExist = true;

                return createLanguageContributeFromProject(newProject);
            }

            return languageContribute;
        }
    );

    if (!doesLanguageContributeExist) {
        packageJson.contributes.languages.push(
            createLanguageContributeFromProject(newProject)
        );
    }

    fs.writeFileSync(
        Paths.packageJsonPath,
        JSON.stringify(packageJson, null, 4)
    );
}

function createGrammarContributeFromProject(
    project: Project
): GrammarContribute {
    let languageId: string = ProjectUtils.getLanguageId(project);

    return {
        language: languageId,
        path: PathUtils.getLanguageSyntaxPath(languageId, true),
        scopeName: Strings.scopeNamePrefix + languageId,
    };
}

function createLanguageContributeFromProject(
    project: Project
): LanguageContribute {
    let languageId: string = ProjectUtils.getLanguageId(project);

    return {
        aliases: [project.languageName, languageId],
        id: languageId,
        extensions: project.fileExtensions,
    };
}
