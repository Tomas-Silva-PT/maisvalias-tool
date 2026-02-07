import { TaxEvent } from "../../models/transaction";
import { Destination } from "../destinations/destination";


type Classifications = Map<Destination, TaxEvent[]>;

export { Classifications };