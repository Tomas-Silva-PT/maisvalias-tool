import { it, describe, expect } from 'vitest';
import { CSVParser } from '../../parsers/csvparser';
import fs from "fs";

describe('CSVParser', () => {
    it('should parse CSV data into BrokerRecord objects', () => {
        const parser = new CSVParser(";");

        const operationsFilePath = './data/mockdata/revolut/revolut_account_statement.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const brokerRecords = parser.parse(operationsFileData);

        // console.log("Broker records: " + JSON.stringify(brokerRecords));

        expect(brokerRecords).toBeDefined();
        expect(brokerRecords.length).toBe(30);
        expect(brokerRecords[0]).toHaveProperty("Date");
        expect(brokerRecords[0]).toHaveProperty("Ticker");
        expect(brokerRecords[0]).toHaveProperty("Total Amount");
    });
});