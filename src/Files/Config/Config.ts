export interface ConfigGrammar {
    type: string;
    values: string[];
}

export interface Config {
    languageName: string;
    fileExtensions: string[];
    mainGrammarPath: string;
    grammar?: ConfigGrammar[];
}
