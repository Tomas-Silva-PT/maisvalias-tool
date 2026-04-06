import { FileParser, FileType } from "../parser";
import { BrokerRecordRow } from "../../models/brokerRecord";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(
  "https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs"
);

class PDFParser implements FileParser {

  async parse(file: ArrayBuffer): Promise<BrokerRecordRow[]> {

    const parser = new PDFParse({ data: file });

    const pdfText = await parser.getText();
    // console.log(pdfText.text);

    const array = pdfText.text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
    // console.log(array);

    const result: BrokerRecordRow[] = array.map((line: string) => [
      ["raw", line]
    ]);

    return result;
  }

}

export { PDFParser };