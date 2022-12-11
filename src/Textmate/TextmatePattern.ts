export interface TextmatePattern {
    begin?: string;
    captures?: {
        [key: string]: string;
    };
    end?: string;
    match?: string;
    name: string;
}
