import { TokenType } from "@/Tokens/Token";

export interface ConfigBlockComment {
    type: TokenType.blockComment;
    begin: string;
    end: string;
}

export interface ConfigGrammarEntry {
    type: TokenType;
    values: string[];
}

export type ConfigGrammar = ConfigBlockComment | ConfigGrammarEntry;

export interface ConfigOptions {
    highlightNumbers?: boolean;
}

export interface Config {
    $schema: string;
    languageName: string;
    fileExtensions: string[];
    mainGrammarPath: string;
    options?: ConfigOptions;
    grammar?: ConfigGrammar[];
}
