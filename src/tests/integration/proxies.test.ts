import { it, expect, describe } from 'vitest';
import { YahooSynoProxy } from '../../models/proxies/YahooSynoProxy.js';
import { AllOriginsProxy } from '../../models/proxies/AllOriginsProxy.js';

describe('Proxies', () => {
    it('should be able to connect to allOriginsProxy', async () => {
        const proxy = new AllOriginsProxy();
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/EUR=X?period1=1735603200&period2=1735689600&interval=1d`;
        let data: unknown;
        const RETRIES = 5;
        let retries = 0;
        while (retries < RETRIES) {
            console.log("Try Number: ", retries + 1);
            try {
                data = await proxy.get(url);
                break;
            } catch (error) {
                console.warn(`Proxy failed: ${proxy.constructor.name}`, error);
            }
            retries++;
        }
        expect(data).toBeDefined();
    }, 15000); // Increased timeout for this test due to potential network delays

    it('should be able to connect to YahooSynoProxy', async () => {
        const proxy = new YahooSynoProxy();
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/EUR=X?period1=1735603200&period2=1735689600&interval=1d`;
        let data: unknown;
        const RETRIES = 5;
        let retries = 0;
        while (retries < RETRIES) {
            console.log("Try Number: ", retries + 1);
            try {
                data = await proxy.get(url);
                break;
            } catch (error) {
                console.warn(`Proxy failed: ${proxy.constructor.name}`, error);
            }
            retries++;
        }
        expect(data).toBeDefined();
    }, 15000); // Increased timeout for this test due to potential network delays
})
