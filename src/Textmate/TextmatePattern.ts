export interface TextmatePattern {
    /**
     * The pattern that starts the block.
     */
    begin?: string;
    /**
     * Captures from the begin pattern can be referenced in the end pattern by using normal regular expression back-references. This is often used with here-docs.
     */
    captures?: Record<string, string>;
    /**
     * The pattern which ends the block.
     */
    end?: string;
    /**
     * A regular expression which is used to identify the portion of text to which the name should be assigned. Example: '\b(true|false)\b'.
     */
    match?: string;
    /**
     * The name which gets assigned to the portion matched. This is used for styling and scope-specific settings and actions, which means it should generally be derived from one of the standard names.
     */
    name: string;
}
