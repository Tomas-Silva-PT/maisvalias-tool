import { BrokerRecordRow, BrokerSection } from "../models/brokerRecord.js";
import { Transaction } from "../models/transaction.js";

interface BrokerParser {
    parse(records : BrokerSection[]): Transaction[];
    canParse(sections: BrokerSection[]): boolean;
}

interface FileParser {
    parse(file: FileType): Promise<BrokerSection[]>;
}

type FileType = string | ArrayBuffer | Buffer;

export { BrokerParser, FileParser, FileType };