import { TextmateRepository } from "@/Textmate/TextmateRepository";

export interface TextmateFile {
    /**
     * The schema version of the Textmate file.
     */
    $schema: string;
    /**
     * The language's name that this `TextmateFile` is for.
     */
    name: string;
    /**
     * The patterns that make up the language.
     */
    patterns: Record<string, string>[];
    /**
     * A dictionary (i.e. key/value pairs) of rules which can be included from other places in the grammar. The key is the name of the rule and the value is the actual rule. Further explanation (and example) follow with the description of the include rule key.
     */
    repository: TextmateRepository;
    /**
     * The scope name of the language.
     */
    scopeName: string;
}
