export enum TokenType {
    blockComment = "blockComment",
    comment = "comment",
    constant = "constant",
    function = "function",
    keyword = "keyword",
    number = "number",
    operator = "operator",
}

export interface BlockCommentToken {
    begin: string;
    end: string;
    type: TokenType.blockComment;
}

export interface RegularToken {
    value: string;
    type: TokenType;
}

export type Token = BlockCommentToken | RegularToken;
