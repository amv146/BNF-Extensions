import { TokenType } from "@/Tokens/Token";

export type ConfigBlockComment = {
    type: TokenType.blockComment;
    begin: string;
    end: string;
};

export type ConfigGrammarEntry = {
    type: Exclude<TokenType, TokenType.blockComment>;
    values: string[];
};

export type ConfigGrammar = ConfigBlockComment | ConfigGrammarEntry;

export interface ConfigOptions {
    /**
     * Whether or not to create a language configuration file for this language. Defaults to `false`.
     */
    createLanguageConfigurationFile?: boolean;
    /**
     * Whether or not to highlight numbers. Defaults to `false`.
     */
    highlightNumbers?: boolean;
}

export interface Config {
    /**
     * The link to the schema for this config file.
     */
    $schema: string;
    /**
     * The name of the language that this config file is for.
     */
    languageName: string;
    /**
     * The file extensions that this config file is for. File extensions should be in the format of `".ext"`.
     */
    fileExtensions: string[];
    /**
     * The path to the main grammar file for this language. This should be a relative path from the root of the project.
     */
    mainGrammarPath?: string;
    /**
     * Additional options for this config file. Currently, the options are:
     * - `createLanguageConfigurationFile`: Whether or not to create a language configuration file for this language. Defaults to `false`.
     * - `highlightNumbers`: Whether or not to highlight numbers. Defaults to `false`.
     * - `highlightCharacters`: Whether or not to highlight characters. Defaults to `false`.
     */
    options?: ConfigOptions;
    /**
     * The grammar for this language. This should be an array of `ConfigGrammar` objects.
     */
    grammar?: ConfigGrammar[];
}
