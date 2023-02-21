import { Config } from "@/Files/Config/Config";

export interface StorageProject {
    config: Config | undefined;
    inode: number;
    path: string;
}
