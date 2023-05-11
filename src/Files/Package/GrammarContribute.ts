export interface GrammarContribute {
    /**
     * Language identifier for which this syntax is contributed to.
     */
    language: string;
    /**
     * Path of the tmLanguage file. The path is relative to the extension folder and typically starts with './syntaxes/'.
     */
    path: string;
    /**
     * Textmate scope name used by the tmLanguage file.
     */
    scopeName: string;
}
