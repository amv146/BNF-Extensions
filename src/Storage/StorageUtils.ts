import * as Extension from "@/Extension";
import { Project } from "@/Files/Project";
import { StorageProject } from "@/Storage/StorageProject";

export async function addProject(project: Project): Promise<void> {
    const storageProjects: StorageProject[] = getStorageProjects();

    storageProjects.push({
        config: await project.getConfig(),
        inode: (await project.getConfig())?.inode ?? 0,
        path: project.getConfigPath(),
    });

    Extension.storageManager.update("projects", storageProjects);
}

export function getProjects(): Project[] {
    const storageProjects: StorageProject[] = getStorageProjects();

    return storageProjects.map((storageProject) => {
        return new Project(storageProject.path, storageProject.config);
    });
}

export async function setProjects(projects: Project[]): Promise<void> {
    const storageProjects: StorageProject[] = await Promise.all(
        projects.map(async (project) => {
            return {
                config: await project.getConfig(),
                inode: (await project.getConfig())?.inode ?? 0,
                path: project.getConfigPath(),
            };
        })
    );

    Extension.storageManager.update("projects", storageProjects);
}

export function getStorageProjects(): StorageProject[] {
    return Extension.storageManager.get("projects") ?? [];
}
