export interface LanguageCommentsConfiguration {
    lineComment?: string;
    blockComment?: [string, string];
}

export interface LanguageConfigurationFile {
    autoClosingPairs?: [string, string][];
    brackets?: [string, string][];
    comments?: LanguageCommentsConfiguration;
    indentationRules?: {
        decreaseIndentPattern?: string;
        increaseIndentPattern?: string;
    };
}
