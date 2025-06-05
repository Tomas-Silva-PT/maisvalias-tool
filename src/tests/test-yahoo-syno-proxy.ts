import { YahooSynoProxy } from "../models/proxies/YahooSynoProxy.js";

const proxy = new YahooSynoProxy();

const url = proxy._replaceDomain("https://query2.finance.yahoo.com/v8/finance/chart/USDEUR=X?period1=1614297600&period2=1641081600&interval=1d");

console.log("URL: " + url);