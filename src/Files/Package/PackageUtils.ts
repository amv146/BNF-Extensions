import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import { GrammarContribute } from "@/Files/Package/GrammarContribute";
import { LanguageContribute } from "@/Files/Package/LanguageContribute";
import * as PathUtils from "@/Files/PathUtils";
import * as Paths from "@/Files/Paths";
import { Project } from "@/Files/Project";
import * as Strings from "@/Strings";

const packageJson = require(Paths.packageJsonPath);

export function updateContributesFromProjects(projects: Project[]): void {
    if (!packageJson.contributes) {
        packageJson.contributes = {};
    } else {
        packageJson.contributes.grammars =
            packageJson.contributes.grammars ?? [];
        packageJson.contributes.languages =
            packageJson.contributes.languages ?? [];
    }

    packageJson.contributes.grammars = createUpdatedContributesFromProjects(
        projects,
        createGrammarContributeFromProject,
        (grammarContribute: GrammarContribute) => grammarContribute.language
    );

    packageJson.contributes.languages = createUpdatedContributesFromProjects(
        projects,
        createLanguageContributeFromProject,
        (languageContribute: LanguageContribute) => languageContribute.id
    );

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

function createUpdatedContributesFromProjects<
    T = LanguageContribute | GrammarContribute
>(
    projects: Project[],
    createContributeFromProject: (project: Project) => T,
    getContributeId: (contribute: T) => string
): T[] {
    const currentContributes: T[] = packageJson.contributes.languages as T[];

    const contributeLanguageIds: string[] = currentContributes.map(
        (contribute: T) => getContributeId(contribute)
    );

    const projectLanguageIds: string[] = projects.map(
        (project) => project.languageId
    );

    const projectsToAdd: Project[] = projects.filter(
        (project) => !contributeLanguageIds.includes(project.languageId)
    );

    const newContributes: T[] = currentContributes
        .filter((contribute: T) =>
            projectLanguageIds.includes(getContributeId(contribute))
        )
        .map((contribute: T) => {
            const project: Project | undefined = projects.find(
                (project) => project.languageId === getContributeId(contribute)
            );

            if (project) {
                return createContributeFromProject(project);
            }

            return contribute;
        });

    projectsToAdd.forEach((project: Project) => {
        newContributes.push(createContributeFromProject(project));
    });

    return newContributes;
}
