import { Country } from "../country.js";
import { Broker } from "./broker.js";

class XTB implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "XTB S.A - Sucursal em Portugal";
        this.country = new Country("PT");
    }

    isEquals(broker1: XTB, broker2: XTB): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { XTB };