import { TaxEvent } from "../../models/transaction";


type Classification<D> = Map<D, TaxEvent[]>;

export { Classification };