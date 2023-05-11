export type LanguageAutoClosingPairsConfiguration = [string, string][];
export type LanguageBracketsConfiguration = [string, string][];

export interface LanguageCommentsConfiguration {
    /**
     * The string that starts a line comment. Defining this will control how VSCode comments out single lines of code.
     */
    lineComment?: string;
    /**
     * The strings that start and end a block comment. Defining this will control how VSCode comments out blocks of code.
     */
    blockComment?: [string, string];
}

export interface LanguageConfigurationFile {
    /**
     * Pairs of characters that will automatically close themselves when typed. For example, if you type `(`, VSCode will automatically insert `)` after it and place the cursor in between the two characters.
     */
    autoClosingPairs?: LanguageAutoClosingPairsConfiguration;
    /**
     * When you move the cursor to a bracket defined here, VSCode will highlight that bracket together with its matching pair.
     */
    brackets?: LanguageBracketsConfiguration;
    /**
     * The comments in this language.
     */
    comments?: LanguageCommentsConfiguration;
    /**
     * The language's indentation settings.
     */
    indentationRules?: {
        /**
         * If a line matches this pattern, then all the lines after it should be indented once (until another rule matches).
         */
        decreaseIndentPattern?: string;
        /**
         * If a line matches this pattern, then all the lines after it should be unindented once (until another rule matches).
         */
        increaseIndentPattern?: string;
    };
}
