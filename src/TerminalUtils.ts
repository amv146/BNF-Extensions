import * as cp from "child_process";

export function executeCommand(
    command: string,
    directory?: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (directory) {
            cp.exec(command, { cwd: directory }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        } else {
            cp.exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        }
    });
}
