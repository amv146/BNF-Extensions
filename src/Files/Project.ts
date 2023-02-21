import { Config } from "@/Files/Config/Config";

export interface Project {
    config: Promise<Config | undefined>;
    configPath: string;
    inode: number;
}
