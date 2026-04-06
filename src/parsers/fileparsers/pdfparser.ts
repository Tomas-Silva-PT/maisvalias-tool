import { PDFParse } from 'pdf-parse';
import { FileParser, FileType } from "../parser";
import { BrokerRecordRow } from "../../models/brokerRecord";

class PDFParser implements FileParser {

  async parse(file: ArrayBuffer | Buffer): Promise<BrokerRecordRow[]> {
    // let data: Buffer;

    // if (Buffer.isBuffer(file)) {
    //   data = file;
    // } else {
    //   data = Buffer.from(file);
    // }

    const parser = new PDFParse({ data: file });

    const pdfText = await parser.getText();
    // console.log(pdfText.text);

    const array = pdfText.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // console.log(array);

    const result: BrokerRecordRow[] = array.map(line => [
      ["raw", line]
    ]);

    return result;
  }

}

export { PDFParser };