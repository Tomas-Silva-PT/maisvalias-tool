import { Transaction } from "../models/transaction.js";

interface Parser {
    parse(fileData : string) : Transaction[];
}

export { Parser };