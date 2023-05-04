import * as EnumUtils from "@/EnumUtils";
import * as RegExps from "@/RegExps";
import {
    LanguageCommentsConfiguration,
    LanguageConfigurationFile,
} from "@/Files/LanguageConfigurationFile";
import {
    BlockCommentToken,
    RegularToken,
    Token,
    TokenType,
} from "@/Tokens/Token";

export const autoClosingPairEndTokensForBeginToken: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
    "<": ">",
    '"': '"',
    "'": "'",
};

export function generateLanguageConfigurationFile(
    tokens: Token[]
): LanguageConfigurationFile {
    const languageConfigurationFile: LanguageConfigurationFile = {};

    const autoClosingPairs: [string, string][] = [];
    const brackets: [string, string][] = [];
    const comments: LanguageCommentsConfiguration = {};

    const lineCommentTokens: Token[] = tokens.filter(
        (token) => token.type === TokenType.comment
    );

    if (lineCommentTokens.length > 0) {
        comments.lineComment = (lineCommentTokens[0] as RegularToken).value;
    }

    const blockCommentTokens: Token[] = tokens.filter(
        (token) => token.type === TokenType.blockComment
    );

    if (blockCommentTokens.length > 0) {
        const blockCommentToken: BlockCommentToken =
            blockCommentTokens[0] as BlockCommentToken;

        comments.blockComment = [
            blockCommentToken.begin,
            blockCommentToken.end,
        ];
    }

    const autoClosingPairTokens: Token[] = tokens.filter(
        (token) => token.type === TokenType.punctuation
    );

    autoClosingPairTokens.forEach((token) => {
        const punctuationToken: RegularToken = token as RegularToken;
        const autoClosingPairEndToken: string | undefined =
            autoClosingPairEndTokensForBeginToken[punctuationToken.value];

        if (!autoClosingPairEndToken) {
            return;
        }

        autoClosingPairs.push([
            punctuationToken.value,
            autoClosingPairEndToken,
        ]);

        if (isBracketToken(punctuationToken)) {
            brackets.push([punctuationToken.value, autoClosingPairEndToken]);
        }
    });

    languageConfigurationFile.autoClosingPairs = autoClosingPairs;
    languageConfigurationFile.brackets = brackets;
    languageConfigurationFile.comments = comments;
    languageConfigurationFile.indentationRules = {
        increaseIndentPattern: RegExps.increaseIndentPattern.source,
    };

    return languageConfigurationFile;
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