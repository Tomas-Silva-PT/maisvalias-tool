import { Country } from "../country.js";
import { Broker } from "./broker.js";

class Revolut implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Revolut";
        this.country = new Country("LT");
    }

    isEquals(broker1: Revolut, broker2: Revolut): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { Revolut };