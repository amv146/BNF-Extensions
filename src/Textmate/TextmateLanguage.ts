import { TokenType } from "../Tokens/Token";

export interface TextmateLanguage {
    schema: string;
    name: string;
    patterns: TokenType[];
    repository: string;
    scopeName: string;
}
