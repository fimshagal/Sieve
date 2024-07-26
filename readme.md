# Sieve

## What is it
It is module to pre-handle errors before sending it to Sentry or other service to reduce spends and save businesses resources

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
import {SieveReport, SieveResponseResolution} from "./lib";

const sieve: Sieve = Sieve.getSingle();

// You can add more complex configuration like
sieve.init({
    // you can prevent browser's default error message 
    // in console with 'preventErrorsDefault'. By default this props 
    // equals 'false'  
    preventErrorsDefault: true,
    // put you 'onError" callback right here
    // but you still able to add more callbacks with external signal
    onError: (errorData: SieveResponseResolution): void => console.log(errorData),
    // put you 'onPanic" callback right here in case of critical error
    onPanic: (errorData: SieveResponseResolution): void => console.log(errorData),
    // your auto report for expansive Sentry is here!
    onAutoReport: (report: SieveReport): void => console.log(SieveReport),
    // you can change level of details for error report
    // by default 'responseResolution' equals 'Sieve.ResponseResolutions.Low' 
    responseResolution: Sieve.ResponseResolutions.High,
    // make sieve able to print some debug message
    debug: true,
    // make certain types error disappear from log trace
    excludeTypes: [Sieve.Types.Eval, Sieve.Types.Unknown],
    // make error with certain message disappear from log trace
    excludeMessages: ["undefined is not a function"],
    // triggers to launch auto reporting
    autoReportTriggers: [
        // launch auto report by time interval
        Sieve.createAutoReportTrigger(Sieve.AutoReportTriggerTypes.TimeInterval, 10000),
        // launch auto report by panic error
        Sieve.createAutoReportTrigger(Sieve.AutoReportTriggerTypes.Panic),
        // launch auto report by cetrain quantity of errors
        Sieve.createAutoReportTrigger(Sieve.AutoReportTriggerTypes.ErrorsQuantity, 10),
    ]
});
```

Also you can get whole error's trace report by getter 'report'

```ts
    import { Sieve } from "./sieve";

    const sieve: Sieve = Sieve.getSingle();
    
    console.log(sieve.report); 
```

## Launch sandbox
Download project and then use

```shell
npm i
```

and then

```shell
npm run start
```

Modify `index.ts` file in the root of `sources` folder to change something in the sandbox


## Docs

### Public methods

**init**

`init(config: Nullable<SieveInitConfig>):void` method which will be used once for initialization Sieve singleton. 
You can call it either with config or without it 

---

**setResponseResolution**

`setResponseResolution(resolution: SieveResponseResolution): void` method to change response resolution mode or response's level of details 
when you need as much details as po

---

**emitError**

`emitError(message: SieveEmitErrorConfig): void` method to create your own synthetic error event with features

---

**filterTrace**

`filterTrace(mask: SieveErrorType): SieveResponseResolutions[]` method to filter result of trace's getter

### Public props

**onError**

`onError: Signal<SieveResponseResolutions>` signal that trigger on any error

---

**onPanic**

`onPanic: Signal<SieveResponseResolutions>` signal that trigger on error with the highest priority

---

**onAutoReport**

`onAutoReport: Signal<SieveReport>` signal that trigger when auto-report is ready

---

**trace**

`trace: SieveResponseResolutions[]` getter that contain all the error events


### Public static methods

**getSingle**

`getSingle(): Sieve` method to get Sieve singleton instance

---

**createAutoReportTrigger**

`createAutoReportTrigger(triggerType: AutoReportTriggerType, value?: number): SieveAutoReportTrigger` method to create auto-report trigger instead constructor creation to make code more simple


### Public static props

**Types**

`Types: Dictionary<SieveErrorType>` prop contains all the error types

---

**ResponseResolutions**

`ResponseResolutions: Dictionary<SieveResponseResolution>` prop contains all the responses resolutions

---

**AutoReportTriggerTypes**

`AutoReportTriggerTypes: Dictionary<AutoReportTriggerType>` prop contains all the auto report trigger's types


### Errors types

Errors can be `Unknown`, `Reference`, `Syntax`, `Type`, `Range`, `Eval`, `Uri`, `ByEmit`


### Response resolutions

Response resolutions can be `Unknown`, `Low`, `Medium`, `High`


### Auto-report trigger's types

Auto-report trigger's types are `Unknown`, `TimeInterval`, `ErrorsQuantity`, `Panic`


### Init config props description