import { Transaction } from "../../../models/transaction.js";
import { BrokerParser } from "../../parser.js";
import { BrokerSection } from "../../../models/brokerRecord.js";
import { RevolutParser2025_v1 } from "./revolutparser2025-v1.js";
import { RevolutParser2026_v1 } from "./revolutparser2026-v1.js";

interface IRevolutParser extends BrokerParser {
  loadIsins(fileData: string): void;
}

class RevolutParser implements IRevolutParser {
  isinData: string = "";
  canParse(sections: BrokerSection[]): boolean {
    for (const parser of RevolutParserFactory.parsers) {
      if (parser.canParse(sections)) {
        return true;
      }
    }
    return false;
  }

  loadIsins(fileData: string): void {
    this.isinData = fileData;
  }

  parse(sections: BrokerSection[]): Transaction[] {

    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da revolut têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for Revolut file...");
    const parser = RevolutParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported Revolut format");
    }
    
    if(this.isinData) {
      parser.loadIsins(this.isinData);
    }
    const transactions = parser.parse(sections);

    return transactions;
  }
}

class RevolutParserFactory {

  static parsers: IRevolutParser[] = [
    new RevolutParser2025_v1(),
    new RevolutParser2026_v1()
  ];

  static createParser(sections: BrokerSection[]) : IRevolutParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable Revolut parser found");
  }
}

export { RevolutParser, IRevolutParser };
