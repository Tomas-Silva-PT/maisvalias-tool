import { TaxEvent } from "../../models/taxevent";
import { Destination } from "../destinations/destination";

type Rule = {
    destination : Destination;
    condition : (taxEvent: TaxEvent) => boolean;
}



export { Rule };