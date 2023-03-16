export enum TokenType {
    blockComment = "blockComment",
    comment = "comment",
    constant = "constant",
    function = "function",
    keyword = "keyword",
    number = "number",
    operator = "operator",
    type = "type",
}

export interface BlockCommentToken {
    type: TokenType.blockComment;
    begin: string;
    end: string;
}

export interface RegularToken {
    type: Exclude<TokenType, TokenType.blockComment>;
    value: string;
}

export type Token = BlockCommentToken | RegularToken;
