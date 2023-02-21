import * as Extension from "@/Extension";
import { Project } from "@/Files/Project";
import { StorageProject } from "@/Storage/StorageProject";
import * as ProjectUtils from "@/Files/ProjectUtils";

export async function addProject(project: Project): Promise<void> {
    const storageProjects: StorageProject[] = getStorageProjects();

    storageProjects.push({
        config: await ProjectUtils.getConfig(project),
        inode: project.inode,
        path: project.configPath,
    });

    Extension.storageManager.update("projects", storageProjects);
}

export function getProjects(): Project[] {
    const storageProjects: StorageProject[] = getStorageProjects();

    return storageProjects.map((storageProject) => {
        return ProjectUtils.create(storageProject.path, storageProject.config);
    });
}

export async function setProjects(projects: Project[]): Promise<void> {
    const storageProjects: StorageProject[] = await Promise.all(
        projects.map(async (project) => {
            return {
                config: await ProjectUtils.getConfig(project),
                inode: (await ProjectUtils.getConfig(project))?.inode ?? 0,
                path: ProjectUtils.getConfigPath(project),
            };
        })
    );

    Extension.storageManager.update("projects", storageProjects);
}

export function getStorageProjects(): StorageProject[] {
    return Extension.storageManager.get("projects") ?? [];
}
