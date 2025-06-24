import { Proxy } from "./Proxy";

class BaseProxy implements Proxy {
    async get(url: string): Promise<any> {
        const parsedUrl = this._replaceDomain(url);
        const response = await fetch(parsedUrl);
        const json = await response.json();
        return json;
    }

    _replaceDomain(url: string): string {
        return encodeURIComponent(url);
    }
}

export { BaseProxy };