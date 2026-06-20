import { Country } from "../country.js";
import { Broker } from "./broker.js";

class LightYear implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Lightyear Europe AS";
        this.country = new Country("EE");
    }

    isEquals(broker1: LightYear, broker2: LightYear): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { LightYear };