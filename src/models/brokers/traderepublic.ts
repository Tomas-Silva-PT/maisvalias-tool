import { Country } from "../country.js";
import { Broker } from "./broker.js";

class TradeRepublic implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Trade Republic";
        this.country = new Country("DE");
    }

    isEquals(broker1: TradeRepublic, broker2: TradeRepublic): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { TradeRepublic };