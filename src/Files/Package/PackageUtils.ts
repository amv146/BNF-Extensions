import { Project } from "@/Files/Project";
import { GrammarContribute } from "@/Files/Package/GrammarContribute";
import { LanguageContribute } from "@/Files/Package/LanguageContribute";
import * as Paths from "@/Files/Paths";
import * as PathUtils from "@/Files/PathUtils";
import * as Strings from "@/Strings";
import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";

let packageJson = require(Paths.packageJsonPath);

export function updateContributesFromProject(project: Project): void {
    if (!packageJson.contributes) {
        packageJson.contributes = {};
    } else {
        packageJson.contributes.grammars =
            packageJson.contributes.grammars ?? [];
        packageJson.contributes.languages =
            packageJson.contributes.languages ?? [];
    }

    const languageId: string = project.languageId;
    let doesGrammarContributeExist: boolean = false;
    let doesLanguageContributeExist: boolean = false;

    packageJson.contributes.grammars = packageJson.contributes.grammars.map(
        (grammarContribute: GrammarContribute) => {
            if (grammarContribute.language === languageId) {
                doesGrammarContributeExist = true;

                return createGrammarContributeFromProject(project);
            }

            return grammarContribute;
        }
    );

    if (!doesGrammarContributeExist) {
        packageJson.contributes.grammars.push(
            createGrammarContributeFromProject(project)
        );
    }

    packageJson.contributes.languages = packageJson.contributes.languages.map(
        (languageContribute: LanguageContribute) => {
            if (languageContribute.id === languageId) {
                doesLanguageContributeExist = true;

                return createLanguageContributeFromProject(project);
            }

            return languageContribute;
        }
    );

    if (!doesLanguageContributeExist) {
        packageJson.contributes.languages.push(
            createLanguageContributeFromProject(project)
        );
    }

    FileSystemEntryUtils.writeJsonFile(Paths.packageJsonPath, packageJson);
}

function createGrammarContributeFromProject(
    project: Project
): GrammarContribute {
    const languageId: string = project.languageId;

    return {
        language: languageId,
        path: PathUtils.getLanguageSyntaxPath(languageId, true),
        scopeName: Strings.scopeNamePrefix + languageId,
    };
}

function createLanguageContributeFromProject(
    project: Project
): LanguageContribute {
    const languageId: string = project.languageId;

    return {
        aliases: [project.languageName, languageId],
        id: languageId,
        extensions: project.fileExtensions,
    };
}
