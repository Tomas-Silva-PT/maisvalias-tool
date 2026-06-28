import { Api } from "./api";
import { Proxy } from "../proxies/Proxy.js";
import { YahooSynoProxy } from "../proxies/YahooSynoProxy.js";
import { DateTime } from "luxon";

type DateInterval = {
    year: number,
    from: DateTime,
    to: DateTime
}

class BaseApi implements Api {
    corsProblem = false;
    proxies: Proxy[] = [new YahooSynoProxy()];//, new AllOriginsProxy()];
    numRetriesCycles: number = 5;

    async get(url: string): Promise<any> {
        let data;
        try {
            if (this.corsProblem) { throw new Error("CORS problem"); }
            let response = await fetch(url);
            data = await response.json();

        }
        catch (error) {
            this.corsProblem = true;
            let retries = 0;
            while (retries < this.proxies.length * this.numRetriesCycles) {
                const proxy = this.proxies[retries % this.proxies.length];
                try {
                    data = await proxy.get(url);
                    break;
                }
                catch (error) {
                    console.warn(`Proxy failed: ${proxy.constructor.name}`, error);
                }
                retries++;
            }

            if (!data) throw new Error("All proxies failed to fetch the required data...");

        }
        if (data.contents) data = JSON.parse(data.contents);
        return data;
    }

    _splitIntervalByYear(dates: DateTime[]): DateInterval[] {
        const result: DateInterval[] = [];

        // Sort dates
        dates.sort((a, b) => a.toMillis() - b.toMillis());

        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        // console.log("Start Date: " + startDate + ", End Date: " + endDate);

        let current = startDate;

        while (current.toMillis() <= endDate.toMillis()) {
            const year = current.year;

            const startOfPeriod = current;
            const endOfYear = DateTime.local(year + 1, 1, 1); // Jan 1 of next year
            const endOfPeriod = endOfYear.toMillis() < endDate.toMillis() ? endOfYear : endDate;

            result.push({
                year,
                from: startOfPeriod,
                to: endOfPeriod,
            });

            // Move to the next period
            current = DateTime.fromMillis(endOfPeriod.toMillis()).plus({ days: 1 });
        }

        // console.log("Number of intervals: " + result.length);
        // console.log("Number of dates: " + dates.length);

        return result;
    }

    // Porque os fornecedores de taxas de câmbio não funcionam com dias finais de semana, temos de ajustar a data para o dia útil mais próximo (normalmente o dia anterior)
    adjustToBusinessDay(date: DateTime): DateTime {
        const weekday = date.weekday; // 1 = Monday, 7 = Sunday

        if (weekday === 6) {
            // Saturday → go back 1 day (Friday)
            // console.log("Date is Saturday, adjusting to previous day (Friday)");
            return date.minus({ days: 1 });
        }

        if (weekday === 7) {
            // Sunday → go back 2 days (Friday)
            // console.log("Date is Sunday, adjusting to previous day (Friday)");
            return date.minus({ days: 2 });
        }

        return date; // Weekday
    }
}

export { BaseApi };