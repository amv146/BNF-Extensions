import { Config } from "./Config/Config";

export interface Project extends Config {
    /**
     * The path to the project's config file which is in the root of the project.
     */
    configPath: string;
    /**
     * The language ID of the language that this project is for.
     */
    languageId: string;
}
