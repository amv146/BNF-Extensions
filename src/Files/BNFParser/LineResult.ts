import { LineType } from "@/Files/BNFParser/LineType";

export interface UnknownLineResult {
    lineType: LineType.unknown;
    line: string;
}

export interface KnownLineResult {
    lineType: LineType;
    line: string;
    match: RegExpExecArray;
}

export type LineResult = UnknownLineResult | KnownLineResult;
