import { Config } from "./Config/Config";

export interface Project extends Config {
    configPath: string;
    languageId: string;
}
