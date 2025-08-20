export function logAlert(...args: any[]) {
    const now = new Date().toLocaleString();
    console.log(`[${now}]`, ...args);
}
