class Trading212Parser extends Parser {
    parse(data) {
        const transactions = [];
        const rows = data.split('\n').map(row => row.split(','));
        const headers = rows.shift();

        rows.forEach(row => {
            const record = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
            if (!record["Time"]) return;

            const [date, time] = record["Time"].split(" ");
            let type = record["Action"].toLowerCase();
            if (type.includes("buy")) type = "Buy";
            else if (type.includes("sell")) type = "Sell";
            else if (type.includes("dividend")) type = "Dividend";
            else return;

            const ticker = record["Ticker"];
            const isin = record["ISIN"];
            const shares = parseFloat(record["No. of shares"]);
            const amount = parseFloat(record["Total"]);
            const amountCurrency = record["Currency (Total)"];
            const assetCurrency = record["Currency (Price / share)"];

            const fees = Object.keys(record)
                .filter(key => key.toLowerCase().includes("fee"))
                .map(feeName => {
                    const feeAmount = parseFloat(record[feeName]);
                    const feeCurrency = record[`Currency (${feeName})`];
                    return new Fee(feeName, feeAmount, feeCurrency);
                }).filter(fee => !isNaN(fee.amount));

            const taxes = Object.keys(record)
                .filter(key => key.toLowerCase().includes("tax"))
                .map(taxName => {
                    const taxAmount = parseFloat(record[taxName]);
                    const taxCurrency = record[`Currency (${taxName})`];
                    return new Tax(taxName, taxAmount, taxCurrency);
                }).filter(tax => !isNaN(tax.amount));

            const transaction = new Transaction(date, time, type, ticker, isin, shares, assetCurrency, amount, amountCurrency, taxes, fees, new Trading212());
            if (transaction.type) transactions.push(transaction);
        });

        return transactions;
    }
}

export { Trading212Parser };