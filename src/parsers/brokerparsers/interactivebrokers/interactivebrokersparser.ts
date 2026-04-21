import { Transaction } from "../../../models/transaction.js";
import { BrokerParser } from "../../parser.js";
import {  BrokerSection } from "../../../models/brokerRecord.js";
import { InteractiveBrokersParser2026_v1 } from "./interactivebrokersparser2026-v1.js";

interface IInteractiveBrokersParser extends BrokerParser {

}

class InteractiveBrokersParser implements IInteractiveBrokersParser {
  canParse(sections: BrokerSection[]): boolean {
    for (const parser of InteractiveBrokersParserFactory.parsers) {
      if (parser.canParse(sections)) {
        return true;
      }
    }
    return false;
  }

  parse(records: BrokerSection[]): Transaction[] {
    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da interactive brokers têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for InteractiveBrokers file...");
    const parser = InteractiveBrokersParserFactory.createParser(records);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported InteractiveBrokers format");
    }

    const transactions = parser.parse(records);

    return transactions;
  }

}

class InteractiveBrokersParserFactory {

  static parsers: IInteractiveBrokersParser[] = [
    new InteractiveBrokersParser2026_v1()
  ];

  static createParser(sections: BrokerSection[]) : IInteractiveBrokersParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable InteractiveBrokers parser found");
  }
}

export { InteractiveBrokersParser, IInteractiveBrokersParser };
