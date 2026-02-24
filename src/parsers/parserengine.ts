import { Transaction } from "../models/transaction";
import { BrokerParser, FileParser, FileType } from "./parser";

class ParserEngine {
    constructor(private fileParser: FileParser, private brokerParser: BrokerParser) {

    }

    parse(file: FileType): Transaction[] {
        const records = this.fileParser.parse(file);
        return this.brokerParser.parse(records);
    }
}

export { ParserEngine };