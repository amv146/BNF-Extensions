import { TokenType, Token } from "./Token";
import { TextmateScope } from "../Textmate/TextmateScope";

export function tokenTypeToTextmateScope(tokenType: TokenType): TextmateScope {
    return TextmateScope[tokenType];
}

export function createToken(name: string, type: TokenType): Token {
    return {
        name,
        type,
    };
}
