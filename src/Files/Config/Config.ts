import { TokenType } from "@/Tokens/Token";

export type ConfigBlockComment = {
    type: TokenType.blockComment;
    begin: string;
    end: string;
};

// Type should be any token type that is not block comment
export type ConfigGrammarEntry = {
    type: Exclude<TokenType, TokenType.blockComment>;
    values: string[];
};

export type ConfigGrammar = ConfigBlockComment | ConfigGrammarEntry;

export interface ConfigOptions {
    createLanguageConfigurationFile?: boolean;
    highlightNumbers?: boolean;
    highlightStrings?: boolean;
    highlightCharacters?: boolean;
}

export interface Config {
    $schema: string;
    languageName: string;
    fileExtensions: string[];
    mainGrammarPath?: string;
    options?: ConfigOptions;
    grammar?: ConfigGrammar[];
}
