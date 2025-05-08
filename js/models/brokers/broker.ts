import { Country } from "../country";

interface Broker {
    name : string;
    country : Country;
    isEquals(broker1: Broker, broker2: Broker): boolean;
}

export { Broker };