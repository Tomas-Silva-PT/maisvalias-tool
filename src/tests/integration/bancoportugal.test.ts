import { it, describe, expect } from 'vitest';
import { DateTime } from 'luxon';
import { BancoPortugal } from '../../models/apis/bancoportugal';

describe('BancoPortugal', () => {
    it('should be able to fetch exchange rate', async () => {
        const exchangeRate = await new BancoPortugal().getExchangeRates('USD', 'EUR', [DateTime.fromISO('2023-10-01')]);
        expect(exchangeRate).toBeDefined();
        console.log("Exchange Rate timezone: ", new Date().getTimezoneOffset());
        expect(Math.round(exchangeRate[0].value * 10000) / 10000).toBe(0.9439);
    });

    it('should be able to fetch multiple exchange rates at the same time', async () => {
        const dates = [
            '2022-04-06',
            '2023-03-01',
            '2024-08-08',
            '2025-06-04']

        const dateTimes = dates.map(dateStr => DateTime.fromISO(dateStr));
        const exchangeRate = await new BancoPortugal().getExchangeRates('USD', 'EUR', dateTimes); //await new BancoPortugal().getExchangeRate('USD', 'EUR', new Date('2023-10-01').toISOString().split('T')[0]);
        console.log(exchangeRate);
        console.log("Exchange Rate timezone: ", new Date().getTimezoneOffset());
        expect(exchangeRate).toBeDefined();
        expect(exchangeRate.length).toBe(4);
        expect(exchangeRate[0].date).toBe('2022-04-06');
        expect(Math.round(exchangeRate[0].value * 10000) / 10000).toBe(0.9155);
        expect(exchangeRate[1].date).toBe('2023-03-01');
        expect(Math.round(exchangeRate[1].value * 10000) / 10000).toBe(0.936);
        expect(exchangeRate[2].date).toBe('2024-08-08');
        expect(Math.round(exchangeRate[2].value * 10000) / 10000).toBe(0.9149);
        expect(exchangeRate[3].date).toBe('2025-06-04');
        expect(Math.round(exchangeRate[3].value * 10000) / 10000).toBe(0.8784);
    });
})