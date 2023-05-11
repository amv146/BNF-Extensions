import * as RegExpUtils from "@/RegExpUtils";
import {
    LanguageAutoClosingPairsConfiguration,
    LanguageBracketsConfiguration,
    LanguageCommentsConfiguration,
    LanguageConfigurationFile,
} from "@/Files/LanguageConfigurationFile";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";

export function generateLanguageConfigurationFile(
    tokens: Token[]
): LanguageConfigurationFile {
    const languageConfigurationFile: LanguageConfigurationFile = {};

    const autoClosingPairs: LanguageAutoClosingPairsConfiguration = [];
    const brackets: LanguageBracketsConfiguration = [["(", ")"]];

    const comments: LanguageCommentsConfiguration = {
        blockComment: getBlockComment(tokens),
        lineComment: getLineComment(tokens),
    };

    tokens.forEach((token) => {
        token = token as RegularToken;

        let autoClosingPairEndToken: string | undefined = endTokenForBeginToken(
            token.value
        );

        if (!autoClosingPairEndToken) {
            return;
        }

        autoClosingPairs.push([token.value, autoClosingPairEndToken]);

        if (isBracketToken(token)) {
            brackets.push([token.value, autoClosingPairEndToken]);
        }
    });

    languageConfigurationFile.autoClosingPairs = autoClosingPairs;
    languageConfigurationFile.brackets = brackets;
    languageConfigurationFile.comments = comments;
    languageConfigurationFile.indentationRules = {
        increaseIndentPattern: RegExpUtils.increaseIndentRegex(
            comments.lineComment ?? "",
            brackets
        ).source,
    };

    return languageConfigurationFile;
}

function endTokenForBeginToken(beginToken: string): string {
    switch (beginToken) {
        case "(":
            return ")";
        case "[":
            return "]";
        case "{":
            return "}";
        case "<":
            return ">";
        case '"':
            return '"';
        case "'":
            return "'";
        case "`":
            return "`";
        default:
            throw new Error(`Unknown begin token: ${beginToken}`);
    }
}

function getBlockComment(tokens: Token[]): [string, string] | undefined {
    const blockCommentTokens: Token[] = tokens.filter(
        (token) => token.type === TokenType.blockComment
    );

    if (blockCommentTokens.length > 0) {
        const blockCommentToken: BlockCommentToken =
            blockCommentTokens[0] as BlockCommentToken;

        return [blockCommentToken.begin, blockCommentToken.end];
    }

    return undefined;
}

function getLineComment(tokens: Token[]): string | undefined {
    const lineCommentTokens: Token[] = tokens.filter(
        (token) => token.type === TokenType.comment
    );

    if (lineCommentTokens.length > 0) {
        return (lineCommentTokens[0] as RegularToken).value;
    }

    return undefined;
}

function isBracketToken(token: RegularToken): boolean {
    switch (token.value) {
        case "(":
        case ")":
        case "[":
        case "]":
        case "{":
        case "}":
        case "<":
        case ">":
            return true;
        default:
            return false;
    }
}
