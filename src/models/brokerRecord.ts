type BrokerRecord = Record<string, string>;
type BrokerRecordRow = [string, string][];
type BrokerSection = {
    number: Number;
    rows: BrokerRecordRow[];
}

export { BrokerRecord, BrokerRecordRow, BrokerSection };