import { Country } from "../country.js";
import { Broker } from "./broker.js";

class Degiro implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Degiro";
        this.country = new Country("NL");
    }

    isEquals(broker1: Degiro, broker2: Degiro): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { Degiro };