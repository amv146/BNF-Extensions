import { Config } from "./Config";

export function getLanguageId(config: Config): string {
    let languageId: string = config.fileExtensions[0];

    if (languageId.startsWith(".")) {
        languageId = languageId.substring(1);
    }

    return languageId;
}
