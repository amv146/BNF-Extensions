export interface Config {
    languageName?: string;
    fileExtensions?: string[];
    mainGrammarPath?: string;
    grammar?: [{ [key: string]: string }];
}
