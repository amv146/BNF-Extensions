import { PredefinedTokenValue } from "./PredefinedTokens";

import { TokenType } from "@/Tokens/Token";

// Convert tokenTypeByPredefinedTokenValue to a function using a switch statement grouped by token type
export function predefinedTokenValueToTokenType(
    predefinedTokenValue: PredefinedTokenValue
): TokenType {
    switch (predefinedTokenValue) {
        case PredefinedTokenValue.false:
        case PredefinedTokenValue.null:
        case PredefinedTokenValue.true:
        case PredefinedTokenValue.undefined:
            return TokenType.constant;
        case PredefinedTokenValue.abstract:
        case PredefinedTokenValue.as:
        case PredefinedTokenValue.assert:
        case PredefinedTokenValue.async:
        case PredefinedTokenValue.await:
        case PredefinedTokenValue.break:
        case PredefinedTokenValue.case:
        case PredefinedTokenValue.catch:
        case PredefinedTokenValue.class:
        case PredefinedTokenValue.const:
        case PredefinedTokenValue.constructor:
        case PredefinedTokenValue.continue:
        case PredefinedTokenValue.declare:
        case PredefinedTokenValue.default:
        case PredefinedTokenValue.delete:
        case PredefinedTokenValue.do:
        case PredefinedTokenValue.else:
        case PredefinedTokenValue.enum:
        case PredefinedTokenValue.export:
        case PredefinedTokenValue.extends:
        case PredefinedTokenValue.finally:
        case PredefinedTokenValue.for:
        case PredefinedTokenValue.from:
        case PredefinedTokenValue.function:
        case PredefinedTokenValue.if:
        case PredefinedTokenValue.implements:
        case PredefinedTokenValue.import:
        case PredefinedTokenValue.in:
        case PredefinedTokenValue.instanceof:
        case PredefinedTokenValue.interface:
        case PredefinedTokenValue.is:
        case PredefinedTokenValue.let:
        case PredefinedTokenValue.module:
        case PredefinedTokenValue.namespace:
        case PredefinedTokenValue.new:
        case PredefinedTokenValue.null:
        case PredefinedTokenValue.of:
        case PredefinedTokenValue.package:
        case PredefinedTokenValue.private:
        case PredefinedTokenValue.protected:
        case PredefinedTokenValue.public:
        case PredefinedTokenValue.rec:
        case PredefinedTokenValue.require:
        case PredefinedTokenValue.return:
        case PredefinedTokenValue.static:
        case PredefinedTokenValue.super:
        case PredefinedTokenValue.switch:
        case PredefinedTokenValue.then:
        case PredefinedTokenValue.this:
        case PredefinedTokenValue.throw:
        case PredefinedTokenValue.true:
        case PredefinedTokenValue.try:
        case PredefinedTokenValue.type:
        case PredefinedTokenValue.typeof:
        case PredefinedTokenValue.undefined:
        case PredefinedTokenValue.var:
        case PredefinedTokenValue.void:
        case PredefinedTokenValue.while:
        case PredefinedTokenValue.with:
        case PredefinedTokenValue.yield:
            return TokenType.keyword;
        case PredefinedTokenValue.any:
        case PredefinedTokenValue.boolean:
        case PredefinedTokenValue.byte:
        case PredefinedTokenValue.char:
        case PredefinedTokenValue.double:
        case PredefinedTokenValue.float:
        case PredefinedTokenValue.int:
        case PredefinedTokenValue.long:
        case PredefinedTokenValue.number:
        case PredefinedTokenValue.object:
        case PredefinedTokenValue.short:
        case PredefinedTokenValue.string:
            return TokenType.type;
        case PredefinedTokenValue["{"]:
        case PredefinedTokenValue["}"]:
        case PredefinedTokenValue["("]:
        case PredefinedTokenValue[")"]:
        case PredefinedTokenValue["["]:
        case PredefinedTokenValue["]"]:
        case PredefinedTokenValue["<"]:
        case PredefinedTokenValue[">"]:
        case PredefinedTokenValue["`"]:
            return TokenType.punctuation;
        case PredefinedTokenValue['"']:
            return TokenType.string;
        case PredefinedTokenValue["'"]:
            return TokenType.character;
    }
}
