import { Config } from "@/Files/Config/Config";

export interface StorageProject {
    configPath: string;
    config: Config | undefined;
}
