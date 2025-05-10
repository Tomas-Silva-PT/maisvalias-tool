import yahooFinance from "yahoo-finance2";

async function getETFInfo() {
  try {
    const data = await yahooFinance.search("US00206R1023"); // Adjust ticker if needed
    console.log(data);
  } catch (error) {
    console.error("Error fetching ETF data:", error);
  }
}

getETFInfo();