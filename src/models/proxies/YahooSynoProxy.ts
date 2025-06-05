import { BaseProxy } from "./BaseProxy.js";

class YahooSynoProxy extends BaseProxy {
    
    _replaceDomain(url: string): string {
        let newUrl = '';
        try {
            const parsedUrl = new URL(url);
            const newDomain = 'https://yahoofinance.escripid.synology.me';
            // Rebuild the URL with the new domain while preserving the path and query
            newUrl = `${newDomain}${parsedUrl.pathname}${parsedUrl.search}`;
        } catch (error) {
            console.error('Invalid URL:', error);
        }
        return newUrl;
    }
}

export { YahooSynoProxy };