import { Config, ConfigGrammar } from "@/Files/Config/Config";
import { Token, TokenType } from "@/Tokens/Token";

import * as EnumUtils from "@/EnumUtils";
import * as TokenUtils from "@/Tokens/TokenUtils";

export function generateTokensFromConfigGrammar(config: Config): Token[] {
    const tokens: Token[] = [];

    if (!config.grammar) {
        return tokens;
    }

    const configGrammar: ConfigGrammar[] = config.grammar;

    for (const configGrammarEntry of configGrammar) {
        const tokenType: TokenType | undefined = EnumUtils.fromStringValue(
            TokenType,
            configGrammarEntry.type
        );

        if (!tokenType || !configGrammarEntry.values) {
            continue;
        }

        for (const value of configGrammarEntry.values) {
            const token: Token = TokenUtils.createToken(value, tokenType);

            tokens.push(token);
        }
    }

    return tokens;
}
