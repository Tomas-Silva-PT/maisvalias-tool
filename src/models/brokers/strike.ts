import { Country } from "../country.js";
import { Broker } from "./broker.js";

class Strike implements Broker {
    static isEquals(broker: any, broker1: any) {
        throw new Error("Method not implemented.");
    }
    
    name: string;
    country: Country;

    constructor() {
        this.name = "Strike";
        this.country = new Country("PL"); //https://strike.me/legal/tos/#:~:text=Zap%20Solutions%20Europe%20Sp.%20z%20o.%20o.%20is%20a%20private%20company%20incorporated%20in%20Poland%20(KRS%20No.%200000985389)%20with%20its%20registered%20office%20in%20Warsaw%2C%20Poland%20at%20ul.%20Grzybowska%202%20/%2029%2C%2000%2D131%20Warsaw%2C%20Poland
    }

    isEquals(broker1: Strike, broker2: Strike): boolean {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}

export { Strike };