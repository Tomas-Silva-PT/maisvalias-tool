import { BrokerParser } from "../../parser.js";
import { BrokerSection } from "../../../models/brokerRecord.js";
import { Transaction } from "../../../models/transaction.js";
import { TradeRepublicParser2026_v1 } from "./traderepublicparser2026-v1.js";


interface ITradeRepublicParser extends BrokerParser {
}

class TradeRepublicParser implements ITradeRepublicParser {
    canParse(sections: BrokerSection[]): boolean {
        for (const parser of TradeRepublicParserFactory.parsers) {
            if (parser.canParse(sections)) {
                return true;
            }
        }
        return false;
    }

    parse(sections: BrokerSection[]): Transaction[] {
        // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da trade republic têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
        console.log("Choosing parser for TradeRepublic file...");
        const parser = TradeRepublicParserFactory.createParser(sections);
        console.log("Chosen parser: " + parser.constructor.name);

        if (!parser) {
            throw new Error("Unsupported TradeRepublic format");
        }

        const transactions = parser.parse(sections);

        return transactions;
    }


}

class TradeRepublicParserFactory {

  static parsers: ITradeRepublicParser[] = [
    new TradeRepublicParser2026_v1()
  ];

  static createParser(sections: BrokerSection[]) : ITradeRepublicParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable Revolut parser found");
  }
}

export { TradeRepublicParser, ITradeRepublicParser };