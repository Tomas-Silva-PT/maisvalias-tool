import { Country } from "../country.js";
import { Broker } from "./broker.js";

class InteractiveBrokers implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Interactive Brokers Ireland Limited";
        this.country = new Country("IE");
    }

    isEquals(broker1: InteractiveBrokers, broker2: InteractiveBrokers): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { InteractiveBrokers };