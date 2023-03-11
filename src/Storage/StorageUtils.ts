import * as Extension from "@/Extension";
import { Project } from "@/Files/Project";

export async function addProject(project: Project): Promise<void> {
    const projects: Project[] = getProjects().filter(
        (tempProject) => tempProject.inode !== project.inode
    );

    projects.push(project);

    setProjects(projects);
}

export function getProjects(): Project[] {
    return Extension.storageManager.get("projects") ?? [];
}

export async function setProjects(projects: Project[]): Promise<void> {
    Extension.storageManager.update("projects", projects);
}
