import { CommentToken, RegularToken, TokenType } from "./Token";

import { ConfigGrammar } from "@/Files/Config/Config";
import { TextmateScope } from "@/Textmate/TextmateScope";
import { SyntaxTokenType } from "@/Tokens/SyntaxToken";
import { Token } from "@/Tokens/Token";

export function tokenTypeToTextmateScope(
    tokenType: SyntaxTokenType
): TextmateScope {
    return TextmateScope[tokenType];
}

export function tokensToConfigGrammar(tokens: Token[]): ConfigGrammar[] {
    const tokensByType: Map<TokenType, Token[]> = new Map();

    tokens.forEach((token) => {
        const tokensOfType = tokensByType.get(token.type) ?? [];

        tokensByType.set(token.type, [...tokensOfType, token]);
    });

    return Array.from(tokensByType.entries()).map(
        ([tokenType, tokensOfType]) => {
            if (tokenType === TokenType.blockComment) {
                return {
                    type: tokenType,
                    begin: (tokensOfType[0] as CommentToken).begin,
                    end: (tokensOfType[0] as CommentToken).end,
                };
            }

            return {
                type: tokenType,
                values: tokensOfType.map(
                    (token) => (token as RegularToken).value
                ),
            };
        }
    );
}
