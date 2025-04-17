// Function to convert table data to CSV format
function tableToCSV(table) {
    const rows = table.querySelectorAll('tr');
    const csvData = [];

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => rowData.push(col.innerText));
        csvData.push(rowData.join(','));
    });

    return csvData.join('\n');
}

// Function to trigger the download of CSV
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Event listeners for the download buttons
document.getElementById('downloadCapitalGainsBtn').addEventListener('click', () => {
    const table = document.getElementById('capitalGainsTable');
    const csv = tableToCSV(table);
    downloadCSV(csv, 'ganhos_de_capital.csv');
});

document.getElementById('downloadDividendsBtn').addEventListener('click', () => {
    const table = document.getElementById('dividendsTable');
    const csv = tableToCSV(table);
    downloadCSV(csv, 'dividendos.csv');
});


const translations = {
    en: {
        "home": "Home",
        "about": "About",
        "contact": "Contact",
        "upload-title": "Upload Your File",
        "upload-desc": "Upload your broker's exported file to calculate capital gains and dividends.",
        "select-country": "Select your country:",
        "select-broker": "Select your broker:",
        "process": "Process File",
        "capital-gains": "Capital Gains",
        "dividends": "Dividends",
        "date": "Date",
        "asset": "Asset",
        "buy-price": "Buy Price",
        "sell-price": "Sell Price",
        "profit-loss": "Profit/Loss",
        "div-received": "Dividend Received",
        "tax-withheld": "Tax Withheld",
        "net-amount": "Net Amount"
    },
    pt: {
        "home": "Início",
        "about": "Sobre",
        "contact": "Contato",
        "upload-title": "Carregue seu Arquivo",
        "upload-desc": "Faça o upload do arquivo exportado da sua corretora para calcular ganhos de capital e dividendos.",
        "select-country": "Selecione seu país:",
        "select-broker": "Selecione sua corretora:",
        "process": "Processar Arquivo",
        "capital-gains": "Ganhos de Capital",
        "dividends": "Dividendos",
        "date": "Data",
        "asset": "Ativo",
        "buy-price": "Preço de Compra",
        "sell-price": "Preço de Venda",
        "profit-loss": "Lucro/Prejuízo",
        "div-received": "Dividendo Recebido",
        "tax-withheld": "Imposto Retido",
        "net-amount": "Valor Líquido"
    }
};

function changeLanguage(lang) {
    document.querySelectorAll("[data-lang]").forEach(element => {
        const key = element.getAttribute("data-lang");
        if (translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });
}

document.getElementById("languageSelect").addEventListener("change", function () {
    changeLanguage(this.value);
});

// Set default language to Portuguese
changeLanguage("pt");
