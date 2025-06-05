import { BaseProxy } from "./BaseProxy";

class AllOriginsProxy extends BaseProxy {

    _replaceDomain(url: string): string {
        return 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
    }

}

export { AllOriginsProxy };