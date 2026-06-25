import { DateTime } from "luxon";

interface Api {
    get: (url: string) => Promise<any>;
}

type ExchangeRate = {
  "timestamp": number,
  "date": DateTime,
  "value": number
}

interface ExchangeRateApi extends Api {
    getExchangeRates: (fromCurrency: string, toCurrency: string, dates: DateTime[]) => Promise<ExchangeRate[]>;
}

class ExchangeRateApiEngine implements ExchangeRateApi {
  private apis: ExchangeRateApi[] = [];
  private currentIndex = 0;

  constructor(apis: ExchangeRateApi[]) {
    if (apis.length === 0) {
      throw new Error("ApiEngine requires at least one API implementation");
    }
    this.apis = apis;
  }

  /** Add a new API implementation dynamically */
  addApi(api: ExchangeRateApi) {
    this.apis.push(api);
  }

  /** Rotate to the next API */
  private rotate() {
    this.currentIndex = (this.currentIndex + 1) % this.apis.length;
  }

  /** Get the current API */
  private get currentApi(): ExchangeRateApi {
    return this.apis[this.currentIndex];
  }

  /** Generic GET with fallback */
  async get(url: string): Promise<any> {
    const tried = new Set<number>();

    while (tried.size < this.apis.length) {
      try {
        return await this.currentApi.get(url);
      } catch (err) {
        console.warn(
          `API #${this.currentIndex} failed on GET. Rotating...`,
          err
        );
        tried.add(this.currentIndex);
        this.rotate();
      }
    }

    throw new Error("All API implementations failed for GET()");
  }

  /** Exchange rate fetch with fallback */
  async getExchangeRates(
    fromCurrency: string,
    toCurrency: string,
    dates: DateTime[]
  ): Promise<ExchangeRate[]> {
    const tried = new Set<number>();

    while (tried.size < this.apis.length) {
      try {
        return await this.currentApi.getExchangeRates(
          fromCurrency,
          toCurrency,
          dates
        );
      } catch (err) {
        console.warn(
          `API #${this.currentIndex} failed on getExchangeRates(). Rotating...`,
          err
        );
        tried.add(this.currentIndex);
        this.rotate();
      }
    }

    throw new Error("All API implementations failed for getExchangeRates()");
  }
}


export { Api, ExchangeRateApi, ExchangeRate, ExchangeRateApiEngine };