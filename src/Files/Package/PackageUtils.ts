import * as FileSystemEntryUtils from "@/Files/FileSystemEntryUtils";
import * as PathUtils from "@/Files/PathUtils";
import * as Paths from "@/Files/Paths";
import * as Strings from "@/Strings";
import { GrammarContribute } from "@/Files/Package/GrammarContribute";
import { LanguageContribute } from "@/Files/Package/LanguageContribute";
import { Project } from "@/Files/Project";

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
        path: PathUtils.languageSyntaxPath(languageId, true),
        scopeName: Strings.scopePrefix + languageId,
    };
}

function createLanguageContributeFromProject(
    project: Project
): LanguageContribute {
    const languageId: string = project.languageId;

    return {
        aliases: [project.languageName, languageId],
        configuration: PathUtils.languageConfigurationPath(languageId, true),
        extensions: project.fileExtensions,
        id: languageId,
    };
}

/**
 * Creates an updated list of contributes from the given projects.
 * @param projects The projects to create the contributes from.
 * @param createContributeFromProject A function that creates a contribute from a project.
 * @param getContributeId A function that gets the ID of a contribute.
 * @returns The updated list of contributes.
 * @template Contribute The type of the contributes.
 */
function createUpdatedContributesFromProjects<
    Contribute = LanguageContribute | GrammarContribute
>(
    projects: Project[],
    createContributeFromProject: (project: Project) => Contribute,
    getContributeId: (contribute: Contribute) => string
): Contribute[] {
    const currentContributes: Contribute[] = packageJson.contributes
        .languages as Contribute[];

    /**
     * Get the language IDs of the current contributes in the `package.json` file.
     */
    const contributeLanguageIds: string[] = currentContributes.map(
        (contribute) => getContributeId(contribute)
    );

    const projectLanguageIds: string[] = projects.map(
        (project) => project.languageId
    );

    /**
     * Projects that are not already in the `package.json` file.
     */
    const projectsToAdd: Project[] = projects.filter(
        (project) => !contributeLanguageIds.includes(project.languageId)
    );

    const newContributes: Contribute[] = currentContributes
        .filter((contribute: Contribute) =>
            projectLanguageIds.includes(getContributeId(contribute))
        )
        .map((contribute: Contribute) => {
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
