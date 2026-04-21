import { Transaction } from "../../../models/transaction";
import { BrokerParser } from "../../parser";
import { BrokerSection } from "../../../models/brokerRecord";
import { StrikeParser2026_v1 } from "./strikeparser2026-v1";

interface IStrikeParser extends BrokerParser {
  
}

class StrikeParser implements IStrikeParser {
  canParse(sections: BrokerSection[]): boolean {
      for (const parser of StrikeParserFactory.parsers) {
        if (parser.canParse(sections)) {
          return true;
        }
      }
      return false;
    }

  parse(sections: BrokerSection[]): Transaction[] {
    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da strike têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for Strike file...");
    const parser = StrikeParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported Strike format");
    }
    
    const transactions = parser.parse(sections);

    return transactions;
  }
}

class StrikeParserFactory {

  static parsers: IStrikeParser[] = [
    new StrikeParser2026_v1()
  ];

  static createParser(sections: BrokerSection[]) : IStrikeParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable Strike parser found");
  }
}

export { StrikeParser, IStrikeParser };