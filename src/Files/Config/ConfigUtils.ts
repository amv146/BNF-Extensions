import * as EnumUtils from "../../EnumUtils";
import * as TokenUtils from "../../Tokens/TokenUtils";
import { Config, ConfigGrammar } from "./Config";
import { TokenType, Token } from "../../Tokens/Token";

export function getLanguageId(config: Config): string {
    let languageId: string = config.fileExtensions[0];

    if (languageId.startsWith(".")) {
        languageId = languageId.substring(1);
    }

    return languageId;
}

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
