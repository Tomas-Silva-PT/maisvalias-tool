import { Proxy } from "./Proxy";

class AllOriginsProxy implements Proxy {
    async get(url: string): Promise<any> {
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
        const json = await response.json();
        return json;
    }
}

export { AllOriginsProxy };