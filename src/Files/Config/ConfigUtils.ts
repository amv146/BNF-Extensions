import { Config } from "@/Files/Config/Config";
import { Token, TokenType } from "@/Tokens/Token";

import * as EnumUtils from "@/EnumUtils";

export function generateTokensFromConfigGrammar(config: Config): Token[] {
    if (!config.grammar) {
        return [];
    }

    let tokens: Token[] = [];

    config.grammar.forEach((configGrammarEntry) => {
        const tokenType: TokenType | undefined = EnumUtils.fromStringValue(
            TokenType,
            configGrammarEntry.type
        );

        if (!tokenType) {
            return;
        } else if (configGrammarEntry.type === TokenType.blockComment) {
            tokens.push({
                value: "beginComment",
                type: tokenType,
            });

            return;
        } else if (!configGrammarEntry.values) {
            return;
        }

        tokens = tokens.concat(
            configGrammarEntry.values.map((value) => {
                return {
                    value,
                    type: tokenType,
                };
            })
        );
    });

    if (config.options?.highlightNumbers) {
        tokens.push({
            value: "number",
            type: TokenType.number,
        });
    }

    return tokens;
}
