import axios from "axios";

// Define the proxy details
const proxy = {
  host: '15.236.106.236', // Replace with the proxy IP address
  port: 3128,           // Replace with the proxy port
  protocol: 'https'      // Replace with the protocol (http/https)
};

const url = 'https://query1.finance.yahoo.com/v8/finance/chart/USDEUR=X?period1=1703980800&period2=1704067200&interval=1d';

async function test() {
  try {
    // Make the request with proxy configuration
    const response = await axios.get(url, {
      proxy: {
        host: proxy.host,
        port: proxy.port
      }
    });
    console.log('Data:', JSON.stringify(response.data));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();