import { BrokerRecord, BrokerRecordRow } from "../models/brokerRecord";
import { FileParser } from "./parser";
import * as Papa from "papaparse";

class CSVParser implements FileParser {

  // separator: string;
  // constructor(separator: string) {
  //   this.separator = separator;
  // }

  // detectSeparator(header: string): string {
  //   const separators = [",", ";", "\t"];
  //   const counts = separators.map((sep) => ({
  //     sep,
  //     count: header.split(sep).length - 1
  //   }));
  //   counts.sort((a, b) => b.count - a.count);
  //   return counts[0].sep;
  // }

  parse(file: string): BrokerRecordRow[] {

    // const stringRows = file.split(/\r?\n/).filter((line) => line.trim().length > 0);
    // if (stringRows.length === 0) {
    //   throw new Error("Invalid CSV: no data found");
    // }
    // const stringHeaders = stringRows[0];
    // let separator = this.separator;
    // if (!separator) {
    //   separator = this.detectSeparator(stringHeaders);
    //   console.log("Detected separator: " + separator);
    // }

    // const rows = stringRows.map((row) => row.split(separator));
    const rows = Papa.parse(file).data as string[][];
    const headers = rows.shift();

    if (!headers) {
      throw new Error("Invalid CSV: no headers found");
    }



    const cleanHeaders = headers.map(h => h.trim());
    const nonEmptyRows = rows.filter(row => row.some(cell => cell.trim() !== ""));

    if (nonEmptyRows.length === 0) {
      throw new Error("Invalid CSV: no data found");
    }

    if (nonEmptyRows.some(row => row.length !== cleanHeaders.length)) {
      console.error("Row length mismatch: ", nonEmptyRows.find(row => row.length !== cleanHeaders.length));
      throw new Error("Invalid CSV: number of columns does not match headers");
    }

    // return nonEmptyRows.map((row) =>
    //   Object.fromEntries(
    //     cleanHeaders.map((h, i) => [
    //       h,
    //       row[i]?.trim() ?? ""
    //     ])
    //   )
    // );
    // O formato de saída é uma matriz (array de arrays: [header, value]), para manter a ordem dos campos e permitir múltiplas colunas com o mesmo nome (caso existam).
    // A Degiro, por exemplo, tem extratos com múltiplas colunas com nome vazio, o que impossibilita o uso de um objeto simples para representar os registros.
    const result : BrokerRecordRow[] = nonEmptyRows.map((row) =>
      cleanHeaders.map((h, i) => [
        h,
        row[i]?.trim() ?? ""
      ])
    );

    return result;
  }
}

export { CSVParser };