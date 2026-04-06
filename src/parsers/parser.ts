import { BrokerRecord, BrokerRecordRow } from "../models/brokerRecord.js";
import { Transaction } from "../models/transaction.js";

interface BrokerParser {
    parse(records : BrokerRecordRow[]) : Transaction[];
}

interface FileParser {
    parse(file: FileType): Promise<BrokerRecordRow[]>;
}

type FileType = string | ArrayBuffer | Buffer;

export { BrokerParser, FileParser, FileType };