import { ConfigGrammar } from "@/Files/Config/Config";
import { TextmateScope } from "@/Textmate/TextmateScope";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";

export function tokenTypeToTextmateScope(tokenType: TokenType): TextmateScope {
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
                    begin: (tokensOfType[0] as BlockCommentToken).begin,
                    end: (tokensOfType[0] as BlockCommentToken).end,
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
