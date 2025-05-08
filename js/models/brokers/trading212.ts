import { Country } from "../country.js";
import { Broker } from "./broker.js";

class Trading212 implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Trading 212 Markets Ltd.";
        this.country = new Country("CY");
    }

    isEquals(broker1: Trading212, broker2: Trading212): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { Trading212 };