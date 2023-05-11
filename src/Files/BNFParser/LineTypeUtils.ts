import * as RegExps from "@/RegExps";
import { LineType } from "@/Files/BNFParser/LineType";

export function lineTypeToBNFRegExp(lineType: LineType): RegExp {
    switch (lineType) {
        case LineType.commentRule:
            return RegExps.bnfCommentPattern;
        case LineType.declarationRule:
            return RegExps.bnfDeclarationPattern;
        case LineType.internalComment:
            return RegExps.bnfInternalCommentPattern;
        case LineType.internalRule:
            return RegExps.bnfInternalRulePattern;
        case LineType.separatorRule:
            return RegExps.bnfSeparatorPattern;
        case LineType.terminatorRule:
            return RegExps.bnfTerminatorPattern;
        case LineType.unknown:
            return RegExp("");
    }
}
