import { it, describe, expect } from 'vitest';
import { YahooFinance } from '../../models/yahoofinance';
import { DateTime } from 'luxon';

describe('YahooFinance', () => {
    it('should be able to identify an asset as an ETF', async () => {
        const isin = 'IE00BJ0KDQ92'; // Example ISIN for an ETF - XDWD
        const assetType = await YahooFinance.getAssetType(isin);
        expect(assetType).toBe('ETF');
    });

    it('should be able to identify an asset as a stock', async () => {
        const isin = 'US0378331005'; // Example ISIN for a stock - AAPL
        const assetType = await YahooFinance.getAssetType(isin);
        expect(assetType).toBe('EQUITY');
    });

    it('should be able to identify multiple assets at the same time', async () => {
        const isins = ['IE00BJ0KDQ92', 'US0378331005', 'IE00BFMXXD54', 'US5949181045', 'PTEDP0AM0009', 'US69608A1088', 'IE00B3WJKG14']; // Example ISINs for an ETF and stocks
        const assetTypes = await YahooFinance.getAssetTypeBatch(isins);
        expect(Object.keys(assetTypes).length).toBe(7); // 7 is the BATCHSIZE defined in the method above
        expect(assetTypes).toStrictEqual({
            'IE00BJ0KDQ92': 'ETF',
            'US0378331005': 'EQUITY',
            'IE00BFMXXD54': 'ETF',
            'US5949181045': 'EQUITY',
            'PTEDP0AM0009': 'EQUITY',
            'US69608A1088': 'EQUITY',
            'IE00B3WJKG14': 'ETF'
        });
    });

    it('should be able to fetch exchange rate', async () => {
        const exchangeRate = await YahooFinance.getExchangeRate('USD', 'EUR', DateTime.fromISO('2023-10-01'));
        expect(exchangeRate).toBeDefined();
        console.log("Exchange Rate timezone: ", new Date().getTimezoneOffset());
        expect(Math.round(exchangeRate * 10000) / 10000).toBe(0.9465);
    });

    it('should be able to fetch multiple exchange rates at the same time', async () => {
        const dates = [
            '2022-04-06',
            '2023-03-01',
            '2024-08-08',
            '2025-06-04']

        const dateTimes = dates.map(dateStr => DateTime.fromISO(dateStr));
        const exchangeRate = await YahooFinance.getExchangeRateBatch('USD', 'EUR', dateTimes); //await YahooFinance.getExchangeRate('USD', 'EUR', new Date('2023-10-01').toISOString().split('T')[0]);
        console.log(exchangeRate);
        console.log("Exchange Rate timezone: ", new Date().getTimezoneOffset());
        expect(exchangeRate).toBeDefined();
        expect(exchangeRate.length).toBe(4);
        expect(exchangeRate[0].date).toBe('2022-04-06');
        expect(Math.round(exchangeRate[0].close * 10000) / 10000).toBe(0.9169);
        expect(exchangeRate[1].date).toBe('2023-03-01');
        expect(Math.round(exchangeRate[1].close * 10000) / 10000).toBe(0.9454);
        expect(exchangeRate[2].date).toBe('2024-08-08');
        expect(Math.round(exchangeRate[2].close * 10000) / 10000).toBe(0.9151);
        expect(exchangeRate[3].date).toBe('2025-06-04');
        expect(Math.round(exchangeRate[3].close * 10000) / 10000).toBe(0.8784);
    });
})