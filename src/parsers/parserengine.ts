import { Transaction } from "../models/transaction";
import { BrokerParser, FileParser, FileType } from "./parser";

class ParserEngine {
    constructor(private fileParser: FileParser, private brokerParser: BrokerParser) {

    }

    async parse(file: FileType): Promise<Transaction[]> {
        const records = await this.fileParser.parse(file);
        return this.brokerParser.parse(records);
    }
}

export { ParserEngine };