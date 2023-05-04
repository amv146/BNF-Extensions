export function fromStringValue<T>(
    enm: { [s: string]: T },
    value: string
): T | undefined {
    return (Object.values(enm) as unknown as string[]).includes(value)
        ? (value as unknown as T)
        : undefined;
}

export function containsKey<T>(enm: { [s: string]: T }, key: string): boolean {
    return Object.keys(enm).includes(key);
}
