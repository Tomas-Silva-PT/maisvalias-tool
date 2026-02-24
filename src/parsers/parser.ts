import { BrokerRecord, BrokerRecordRow } from "../models/brokerRecord.js";
import { Transaction } from "../models/transaction.js";

interface BrokerParser {
    parse(records : BrokerRecordRow[]) : Transaction[];
}

interface FileParser {
    parse(file: string | ArrayBuffer): BrokerRecordRow[];
}

type FileType = string | ArrayBuffer;

export { BrokerParser, FileParser, FileType };