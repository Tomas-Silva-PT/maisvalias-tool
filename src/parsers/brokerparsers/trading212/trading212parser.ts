import { Transaction } from "../../../models/transaction.js";
import { BrokerParser } from "../../parser.js";
import { BrokerSection } from "../../../models/brokerRecord.js";
import { Trading212Parser2025_v1 } from "./trading212parser2025-v1.js";

interface ITrading212Parser extends BrokerParser {

}

class Trading212Parser implements ITrading212Parser {
  canParse(sections: BrokerSection[]): boolean {
    for (const parser of Trading212ParserFactory.parsers) {
      if (parser.canParse(sections)) {
        return true;
      }
    }
    return false;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da trading212 têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for Trading212 file...");
    const parser = Trading212ParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported Trading212 format");
    }

    const transactions = parser.parse(sections);

    return transactions;
  }


}

class Trading212ParserFactory {

  static parsers: ITrading212Parser[] = [
    new Trading212Parser2025_v1(),
  ];

  static createParser(sections: BrokerSection[]): ITrading212Parser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable Trading212 parser found");
  }
}

export { Trading212Parser, ITrading212Parser };
