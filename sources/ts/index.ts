import { onDocReady } from "./utils";
import { Sieve } from "./sieve";
import { SieveReport, SieveResponseResolutions} from "./sieve/lib";
import { SieveAutoReportTrigger } from "./sieve/sieve.auto.report.trigger";

(async (): Promise<void> => {
    await onDocReady();

    const sieve: Sieve = Sieve.getSingle();

    sieve.init({
        preventErrorsDefault: true,
        sign: 'TestProject',
        onError: (errorData: SieveResponseResolutions): void => console.log(errorData),
        onPanic: (errorData: SieveResponseResolutions): void => console.log("PANIC!!!", errorData),
        onAutoReport: (report: SieveReport): void => console.log(report),
        responseResolution: Sieve.ResponseResolutions.High,
        panicMessages: [/Customchik/g],
        autoReportTriggers: [
            new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.TimeInterval, 10000),
            new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.Panic),
            new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.ErrorsQuantity, 10),
        ],
    });

    setTimeout(() => {
        let z = {};
        z.a = z.b.a - 1;
    }, 3000);

    window.onclick = () => {
        a + b;
    };

    sieve.emitError({
        message: "Customchik",
        customData: {
            a: 1,
            b: 2,
            c: null,
        },
    });

})();