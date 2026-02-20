import { TaxEvent } from "../../models/taxevent";
import { Destination } from "../destinations/destination";


type Classifications = Map<Destination, TaxEvent[]>;

export { Classifications };