import { TaxEvent } from "../../models/transaction";

type Rule<D> = {
    destination : D;
    condition : (taxEvent: TaxEvent) => boolean;
}



export { Rule };