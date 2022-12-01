import * as vscode from "vscode";
import * as path from "path";
import { window } from "vscode";

import * as VSCodeUtils from "./VSCodeUtils";

interface GrammarFileQuickPickItem extends vscode.QuickPickItem {
    path: string;
}

export async function promptForLanguageName(): Promise<string | undefined> {
    const languageName: string | undefined = await window.showInputBox({
        prompt: "Enter the name of the language.",
    });

    return languageName;
}

export async function promptForFileExtension(): Promise<string | undefined> {
    const fileExtension: string | undefined = await window.showInputBox({
        prompt: "Enter the file extension of the language.",
    });

    return fileExtension;
}

export async function promptForMainGrammarFile(
    grammarFiles: string[]
): Promise<string | undefined> {
    const quickPickItems: GrammarFileQuickPickItem[] = grammarFiles.map(
        (grammarFile) => {
            return {
                description: path.relative(
                    VSCodeUtils.getWorkspaceRootPath(),
                    grammarFile
                ),
                label: path.basename(grammarFile),
                path: grammarFile,
            };
        }
    );

    return (
        await window.showQuickPick(quickPickItems, {
            placeHolder: "Select a grammar file",
        })
    )?.path;
}
