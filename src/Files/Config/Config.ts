export interface ConfigGrammar {
    type: string;
    values: string[];
}

export interface Config {
    $schema: string;
    languageName: string;
    fileExtensions: string[];
    mainGrammarPath: string;
    grammar?: ConfigGrammar[];
}
