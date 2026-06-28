import { DateTime } from "luxon";
import { BaseApi } from "./baseapi.js";
import { ExchangeRate, ExchangeRateApi } from "./api.js";

class BancoPortugal extends BaseApi implements ExchangeRateApi {

  async getExchangeRates(fromCurrency: string, toCurrency: string, dates: DateTime[]): Promise<ExchangeRate[]> {
    let exchangeRates: ExchangeRate[] = [];
    const series_id = this.getSeriesId(fromCurrency);

    if (series_id === 0) {
      throw new Error(`[BancoPortugal] Unknown currency: ${fromCurrency}`);
    }

    const intervals = this._splitIntervalByYear(dates);
    // console.log(`[BancoPortugal] Intervals (${intervals.length}): `, intervals);
    // console.log(`[BancoPortugal] Dates (${dates.length}): `, dates);

    if (intervals.length < dates.length) {
      console.log("[BancoPortugal] Fetching exchange rates by intervals...");

      for (let interval of intervals) {
        const from = this.adjustToBusinessDay(interval.from);
        const to = this.adjustToBusinessDay(interval.to);

        const fromString = from.toFormat("yyyyLLdd");
        const toString = to.toFormat("yyyyLLdd");

        const url = `https://bpstat.bportugal.pt/data/v1/domains/29/datasets/23e0cdd56bddb4ad3016a9c3ad63a539/?series_ids=${series_id}&obs_since=${fromString}&obs_to=${toString}`;
        const data = await this.get(url);

        const d = data.dimension.reference_date.category.index;
        const v = data.value;

        const rates = d.map((date: string, i: number) => ({
          timestamp: DateTime.fromISO(date).toMillis() / 1000,
          date: DateTime.fromISO(date),
          value: 1.0 / v[i]
        }));

        exchangeRates = exchangeRates.concat(rates);
      }

    } else {
      console.log("[BancoPortugal] Fetching exchange rates by specific dates...");

      for (const date of dates) {
        const rate = await this.fetchWithDateFallback(series_id, date);
        exchangeRates.push(rate);
      }
    }

    // Remove duplicados
    const unique = new Map<number, ExchangeRate>();
    for (const r of exchangeRates) unique.set(r.timestamp, r);

    const finalRates = Array.from(unique.values());

    // MENSAGEM FINAL SE NADA FOI OBTIDO
    if (finalRates.length === 0) {
      throw new Error(
        `[BancoPortugal] Não foi possível obter qualquer taxa de câmbio para ${fromCurrency} → ${toCurrency} nas datas fornecidas (mesmo após fallback de 8 dias).`
      );
    }

    return finalRates;
  }


  async _delayedFetch(url: string, delay?: number, fallbackDelay?: number): Promise<any> {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      let response = await fetch(url);
      let data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Fetch failed:", error);
      console.warn("Retrying in 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, fallbackDelay));
      return await this._delayedFetch(url);
    }
  }

  private async fetchWithDateFallback(
    seriesId: number,
    date: DateTime,
    attempts = 0
  ): Promise<ExchangeRate> {

    if (attempts > 8) {
      throw new Error(`[BancoPortugal] No exchange rate found for ${date.toISODate()} after 8 fallback attempts`);
    }

    const adjusted = this.adjustToBusinessDay(date.minus({ days: attempts }));
    const dateString = adjusted.toFormat("yyyyLLdd");

    const url = `https://bpstat.bportugal.pt/data/v1/domains/29/datasets/23e0cdd56bddb4ad3016a9c3ad63a539/?series_ids=${seriesId}&obs_since=${dateString}&obs_to=${dateString}`;

    try {
      const data = await this.get(url);

      const dates = data?.dimension?.reference_date?.category?.index;
      const values = data?.value;

      if (!dates || !values || dates.length === 0) {
        throw new Error("No data");
      }

      // console.log(`[BancoPortugal] Fetched exchange rate for ${dateString} ${dates[0]}: 1 ${seriesId} = ${1.0 / values[0]} EUR`);

      return {
        timestamp: DateTime.fromISO(dates[0]).toMillis() / 1000,
        date: DateTime.fromISO(dates[0]),
        value: 1.0 / values[0]
      };

    } catch (err) {
      console.warn(`[BancoPortugal] No data for ${dateString}. Trying previous day...`);
      return this.fetchWithDateFallback(seriesId, date, attempts + 1);
    }
  }


  getSeriesId(currency: string): number {
    const currencyToSeries: Record<string, number> = {
      AUD: 12531935,
      CAD: 12531936,
      CVE: 12531937,
      CNY: 12531938,
      CZK: 12531941,
      DKK: 12531942,
      HKD: 12531945,
      HUF: 12531946,
      ISK: 12531947,
      INR: 12531948,
      IDR: 12531949,
      ILS: 12531950,
      JPY: 12531951,
      KRW: 12531952,
      MOP: 12531955,
      MYR: 12531956,
      MXN: 12531958,
      NZD: 12531959,
      NOK: 12531960,
      PHP: 12531961,
      SGD: 12531963,
      ZAR: 12531966,
      SEK: 12531967,
      CHF: 12531968,
      THB: 12531969,
      GBP: 12531970,
      USD: 12531971,
      PLN: 12531973,
      TRY: 12531974,
      RON: 12531975,
      BRL: 12531976
    };

    return currencyToSeries[currency] || 0;

  }

}

export { BancoPortugal, ExchangeRate };
