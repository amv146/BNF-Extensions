import { Config } from "@/Files/Config/Config";
import { RegularToken, Token, TokenType } from "@/Tokens/Token";

export function generateTokensFromConfigGrammar(config: Config): Token[] {
    if (!config.grammar) {
        return [];
    }

    let tokens: Token[] = [];

    config.grammar.forEach((configGrammarEntry) => {
        if (configGrammarEntry.type === TokenType.blockComment) {
            tokens.push({
                begin: configGrammarEntry.begin,
                end: configGrammarEntry.end,
                type: TokenType.blockComment,
            });

            return;
        } else if (!configGrammarEntry.values) {
            return;
        } else {
            const newTokens: RegularToken[] = configGrammarEntry.values.map(
                (value) => ({
                    type: configGrammarEntry.type,
                    value,
                })
            );

            tokens = [...tokens, ...newTokens];
        }
    });

    if (config.options?.highlightNumbers) {
        tokens.push({
            value: "number",
            type: TokenType.number,
        });
    }
    if (config.options?.highlightStrings) {
        tokens.push({
            value: "string",
            type: TokenType.string,
        });
    }
    if (config.options?.highlightCharacters) {
        tokens.push({
            value: "character",
            type: TokenType.character,
        });
    }

    return tokens;
}
