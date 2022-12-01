import { TextmateScope } from "../Textmate/TextmateScope";

export const enum TokenType {
    comment = "comment",
    function = "function",
    keyword = "keyword",
    operator = "operator",
}

export interface Token {
    name: string;
    type: TokenType;
    textmateScope: TextmateScope;
}
