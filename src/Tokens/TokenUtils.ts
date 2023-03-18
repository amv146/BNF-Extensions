import { ConfigGrammar } from "@/Files/Config/Config";
import { TextmateScope } from "@/Textmate/TextmateScope";
import { SemanticTokenType } from "@/Tokens/ParsedSemanticToken";
import { CommentToken, RegularToken, Token, TokenType } from "@/Tokens/Token";

export function tokenTypeToTextmateScope(tokenType: TokenType): TextmateScope {
    return TextmateScope[tokenType];
}

// export function tokenTypeToSemanticTokenType(
//     tokenType: TokenType
// ): SemanticTokenType {
//     return SemanticTokenType[tokenType];
// }

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

export function groupTokensByType(tokens: Token[]): Map<TokenType, Token[]> {
    return tokens.reduce((currentTokensByType, token) => {
        const tokensOfType = currentTokensByType.get(token.type) ?? [];

        return currentTokensByType.set(token.type, [...tokensOfType, token]);
    }, new Map<TokenType, Token[]>());
}
