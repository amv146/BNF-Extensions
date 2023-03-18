import { TokenType } from "@/Tokens/Token";

export interface CommentPattern {
    begin: string;
    end: string;
    type: TokenType.blockComment | TokenType.comment;
}

export interface RegularPattern {
    match: string;
    type: Exclude<TokenType, TokenType.blockComment | TokenType.comment>;
}

export type Pattern = CommentPattern | RegularPattern;
