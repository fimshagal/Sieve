# Sieve

## What is it
It is module to pre-handle errors before sending it to Sentry or other service to reduce spends and economy businesses resources

## How to use

### Simple common approach

```ts
import { Sieve } from "./sieve";
import { SieveResponseResolutions } from "./lib";

// Sieve provide itself as singleton only
const sieve: Sieve = Sieve.getSingle();

// Init required
sieve.init();

// Add your own callbacks to 'onError' signal
sieve.onError.add((errorData: SieveResponseResolutions) => {
    console.log(errorData);
});
```
---
### Advance usage

```ts
import {Sieve} from "./sieve";
import {SieveReport, SieveResponseResolutions} from "./lib";

const sieve: Sieve = Sieve.getSingle();

// You can add more complex configuration like
sieve.init({
    // you can prevent browser's default error message 
    // in console with 'preventErrorsDefault'. By default this props 
    // equals 'false'  
    preventErrorsDefault: true,
    // put you 'onError" callback right here
    // but you still able to add more callbacks with external signal
    onError: (errorData: SieveResponseResolutions): void => console.log(errorData),
    // put you 'onPanic" callback right here in case of critical error
    onPanic: (errorData: SieveResponseResolutions): void => console.log(errorData),
    // your auto report for expansive Sentry is here!
    onAutoReport: (report: SieveReport): void => console.log(SieveReport),
    // you can change level of details for error report
    // by default 'responseResolution' equals 'Sieve.ResponseResolutions.Low' 
    responseResolution: Sieve.ResponseResolutions.High,
    // make sieve able to print some debug message
    debug: true,
    // make certain types error disappear from log trace
    excludeTypes: [Sieve.Types.Reference],
    // make error with certain message disappear from log trace
    excludeMessages: ["undefined is not a function"],
    // triggers to launch auto reporting
    autoReportTriggers: [
        // launch auto report by time interval
        new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.TimeInterval, 10000),
        // launch auto report by panic error
        new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.Panic),
        // launch auto report by cetrain quantity of errors
        new SieveAutoReportTrigger(Sieve.AutoReportTriggerTypes.ErrorsQuantity, 10),
    ]
});
```

There are several data-object inside Sieve as static props

```ts
    // Response resolutions
    Sieve.ResponseResolutions.Low;

    // Errors types
    Sieve.Types.Eval;
```

Also you can get some error trace report by getter 'report'

```ts
    import { Sieve } from "./sieve";

    const sieve: Sieve = Sieve.getSingle();
    
    console.log(sieve.report); 
```