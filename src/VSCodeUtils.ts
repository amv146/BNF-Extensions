import * as vscode from "vscode";
import * as path from "path";

export async function getSelectedExplorerFileSystemEntry(): Promise<string> {
    const originalClipboard = await vscode.env.clipboard.readText();

    await vscode.commands.executeCommand("copyFilePath");

    const selectedEntryPath: string = await vscode.env.clipboard.readText(); // returns a string

    await vscode.env.clipboard.writeText(originalClipboard);

    if (selectedEntryPath === ".") {
        return getWorkspaceRootPath();
    }

    return selectedEntryPath;
}

export function getWorkspaceRootPath(): string {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
}
