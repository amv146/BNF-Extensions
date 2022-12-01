import * as fs from "fs";

import { GrammarContribute } from "./GrammarContribute";

let packageJson = require("../package.json");

export function addGrammarContribute(
    grammarContribute: GrammarContribute,
    packageJson: any
): void {
    if (!packageJson.contributes) {
        packageJson.contributes = {};
    }

    if (!packageJson.contributes.grammars) {
        packageJson.contributes.grammars = [];
    }

    packageJson.contributes.grammars.push(grammarContribute);
}
