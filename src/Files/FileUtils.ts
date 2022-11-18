export function getPathArray(path: string) {
    return path.split('/');
}

export function getFolderAbove(path: string, numAbove: number, fullPath: boolean = false) {
    return getPathArray(path).slice(
        fullPath ? 0 : -numAbove - 1,
        -numAbove
    ).join('/');
}