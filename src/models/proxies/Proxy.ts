interface Proxy {
    get(url: string): Promise<any>;
}

export { Proxy };