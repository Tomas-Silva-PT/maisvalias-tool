import { it, describe, expect } from 'vitest';
import { CSVParser } from '../../parsers/fileparsers/csvparser';
import fs from "fs";

describe('CSVParser', () => {
    it('should parse CSV data into BrokerRecord objects', async () => {
        const parser = new CSVParser();

        const operationsFilePath = './data/mockdata/revolut/revolut_account_statement.csv';
        const operationsFileData = fs.readFileSync(operationsFilePath, 'utf8');
        const brokerSection = await parser.parse(operationsFileData);

        // console.log("Broker records: " + JSON.stringify(brokerSection));

        expect(brokerSection).toBeDefined();
        expect(brokerSection[0].rows.length).toBe(30);
        expect(brokerSection[0].rows[0][0][0]).toBe("Date");
        expect(brokerSection[0].rows[0][1][0]).toBe("Ticker");
        expect(brokerSection[0].rows[0][2][0]).toBe("Type");
    });
});