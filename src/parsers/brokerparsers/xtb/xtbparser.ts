import { Transaction } from "../../../models/transaction.js";
import { BrokerParser } from "../../parser.js";
import { BrokerSection } from "../../../models/brokerRecord.js";
import { XTBParser2026_v1 } from "./xtbparser2026-v1.js";

interface IXTBParser extends BrokerParser {

}

class XTBParser implements IXTBParser {
  canParse(sections: BrokerSection[]): boolean {
    for (const parser of XTBParserFactory.parsers) {
      if (parser.canParse(sections)) {
        return true;
      }
    }
    return false;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da xtb têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for XTB file...");
    const parser = XTBParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported XTB format");
    }

    const transactions = parser.parse(sections);

    return transactions;
  }


}

class XTBParserFactory {

  static parsers: IXTBParser[] = [
    new XTBParser2026_v1(),
  ];

  static createParser(sections: BrokerSection[]): IXTBParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable XTB parser found");
  }
}

export { XTBParser, IXTBParser };
