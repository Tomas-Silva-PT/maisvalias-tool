import { Transaction } from "../../../models/transaction";
import { BrokerParser } from "../../parser";
import { BrokerRecordRow, BrokerSection } from "../../../models/brokerRecord";
import { DegiroParser2025_v1 } from "./degiroparser2025-v1";

interface IDegiroParser extends BrokerParser {
    loadAccountResume(records: BrokerSection[]): void;
}

class DegiroParser implements IDegiroParser {
    canParse(sections: BrokerSection[]): boolean {
        for (const parser of DegiroParserFactory.parsers) {
            if (parser.canParse(sections)) {
                return true;
            }
        }
        return false;
    }

    accountResume: BrokerSection[] = [];

    loadAccountResume(records: BrokerSection[]) {
        this.accountResume = records;
    }

    parse(sections: BrokerSection[]): Transaction[] {
        // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da degiro têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for Degiro file...");
    const parser = DegiroParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported Degiro format");
    }

    if (parser.loadAccountResume) {
        parser.loadAccountResume(this.accountResume);
    }
    const transactions = parser.parse(sections);

    return transactions;
    }
}

class DegiroParserFactory {

  static parsers: IDegiroParser[] = [
    new DegiroParser2025_v1()
  ];

  static createParser(sections: BrokerSection[]) : IDegiroParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable Degiro parser found");
  }
}

export { DegiroParser, IDegiroParser };