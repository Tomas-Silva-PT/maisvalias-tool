import { BrokerRecordRow, BrokerSection } from "../models/brokerRecord.js";
import { Transaction } from "../models/transaction.js";

interface BrokerParser {
    parse(records : BrokerRecordRow[] | BrokerSection[]): Transaction[];
}

interface FileParser {
    parse(file: FileType): Promise<BrokerRecordRow[] | BrokerSection[]>;
}

type FileType = string | ArrayBuffer | Buffer;

export { BrokerParser, FileParser, FileType };