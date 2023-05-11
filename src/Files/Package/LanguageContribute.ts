export interface LanguageContribute {
    /**
     * Name aliases for the language.
     */
    aliases: string[];
    /**
     * A relative path to a file containing configuration options for the language.
     */
    configuration?: string;
    /**
     * File extensions associated to the language.
     */
    extensions: string[];
    /**
     * ID of the language.
     */
    id: string;
}
