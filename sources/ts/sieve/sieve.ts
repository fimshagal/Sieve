import {
    SieveEmitErrorConfig,
    ISieve,
    SieveErrorDataInnerReport,
    SieveErrorType,
    SieveInitConfig,
    SieveTarget,
    Dictionary,
    SieveKnownBrowser,
    SieveKnownOS,
    Nullable,
    SieveScreenOrientation,
    Navigator,
    SieveResponseResolution,
    SieveResponseResolutions,
    SieveReport, ISieveResponseMediumResolution, ISieveResponseHighResolution, ErrorMessageRule, AutoReportTriggerType
} from "./lib";
import { genSingletonLock } from "../utils";
import { SieveCustomError } from "./sieve.custom.error";
import { Signal } from "signal-ts";
import { SieveErrorTypes } from "./sieve.error.types";
import { SieveKnownBrowsers } from "./sieve.known.browsers";
import { SieveKnownOSs } from "./sieve.known.oss";
import { is } from "../utils";
import { SieveScreenOrientations } from "./sieve.screen.orientations";
import { SieveResponseResolutionTypes } from "./sieve.response.resolution.types";
import { SieveResponseHighResolution, SieveResponseMediumResolution, SieveResponseLowResolution } from "./responseResolutions";
import { getHarmonyAverage } from "../utils/get.harmony.average";
import { SieveAutoReportTrigger } from "./sieve.auto.report.trigger";
import { clearInterval, setInterval } from 'worker-timers';
import {SieveAutoReportTriggersTypes} from "./sieve.auto.report.triggers.types";

const SieveSingletonLock = Symbol(genSingletonLock('SieveSingletonLock'));

const singletonWarningMessage: string = "Sieve singleton error! Sieve is a singleton object, you can get its single instance only with static method \"getSingle\"";

export class Sieve implements ISieve {
    private static _singleInstance: Sieve;

    private readonly static _customDataKey: string = "_sieveCustomData_";

    public static Types: Dictionary<SieveErrorType> = SieveErrorTypes;
    public static ResponseResolutions: Dictionary<SieveResponseResolution> = SieveResponseResolutionTypes;
    public static AutoReportTriggerTypes: Dictionary<AutoReportTriggerType> = SieveAutoReportTriggersTypes;

    public onError: Signal<SieveResponseResolutions> = new Signal<SieveResponseResolutions>();
    public onPanic: Signal<SieveResponseResolutions> = new Signal<SieveResponseResolutions>();
    public onAutoReport: Signal<SieveReport> = new Signal<SieveReport>();

    private _isInit: boolean = false;

    private _sign: string = `Anonymous_${Date.now()}`;
    private _preventErrorsDefault: boolean = false;
    private _target: SieveTarget = window;
    private _trace: SieveResponseResolutions[] = [];
    private _excludeTypes: SieveErrorType[] = [];
    private _excludeMessages: ErrorMessageRule[] = [];
    private _panicMessages: ErrorMessageRule[] = [];
    private _excludeBrowsers: SieveKnownBrowser[] = [];
    private _excludeDesktop: boolean = false;
    private _excludeMobile: boolean = false;
    private _debug: boolean = false;
    private _lastErrorTimestamp: number = 0;
    private _isMobile: boolean = false;
    private _os: SieveKnownOS = SieveKnownOSs.Unknown;
    private _browser: SieveKnownBrowser = SieveKnownBrowsers.Unknown;
    private _responseResolution: SieveResponseResolution = SieveResponseResolutionTypes.Low;
    private _reportTraceIndex: number = 0;
    private _autoReportTriggers: Nullable<SieveAutoReportTrigger[]> = null;
    private _autoReportTimer = null;
    private _countNewErrorsBeforeReport: number = 0;

    constructor(singletonLock?: symbol) {
        if (Sieve._singleInstance) {
            throw Error(singletonWarningMessage);
        }

        if (singletonLock !== SieveSingletonLock) {
            throw Error(singletonWarningMessage);
        }
    }

    public static getSingle(): Sieve  {
        if (!Sieve._singleInstance) {
            Sieve._singleInstance = new Sieve(SieveSingletonLock);
        }
        return Sieve._singleInstance;
    }

    private applyConfig(config: SieveInitConfig): void {
        const {
            sign,
            preventErrorsDefault,
            target,
            onError,
            onPanic,
            onAutoReport,
            excludeTypes,
            excludeMessages,
            panicMessages,
            excludeBrowsers,
            excludeDesktop,
            excludeMobile,
            debug,
            responseResolution,
            autoReportTriggers,
        } = config;

        if (sign) {
            this._sign = sign;
        }

        if (preventErrorsDefault) {
            this._preventErrorsDefault = preventErrorsDefault;
        }

        if (target) {
            this._target = target;
        }

        if (onError) {
            this.onError.add(onError);
        }

        if (onPanic) {
            this.onPanic.add(onPanic);
        }

        if (onAutoReport) {
            this.onAutoReport.add(onAutoReport);
        }

        if (excludeTypes) {
            this._excludeTypes = excludeTypes;
        }

        if (excludeDesktop) {
            this._excludeDesktop = excludeDesktop;
        }

        if (excludeBrowsers) {
            this._excludeBrowsers = excludeBrowsers;
        }

        if (excludeMobile) {
            this._excludeMobile = excludeMobile;
        }

        if (excludeMessages) {
            this._excludeMessages = excludeMessages;
        }

        if (panicMessages) {
            this._panicMessages = panicMessages;
        }

        if (debug) {
            this._debug = debug;
        }

        if (responseResolution) {
            this._responseResolution = responseResolution;
        }

        if (autoReportTriggers) {
            this._autoReportTriggers = autoReportTriggers;
        }
    }

    private listenErrors() {
        this._target.addEventListener("error", this.handleOnError.bind(this));
    }

    private getErrorType(error: Error): SieveErrorType {
        if (error instanceof ReferenceError) {
            return SieveErrorTypes.Reference;
        } else if (error instanceof SyntaxError) {
            return SieveErrorTypes.Syntax;
        } else if (error instanceof TypeError) {
            return SieveErrorTypes.Type;
        } else if (error instanceof RangeError) {
            return SieveErrorTypes.Range;
        } else if (error instanceof EvalError) {
            return SieveErrorTypes.Eval;
        } else if (error instanceof URIError) {
            return SieveErrorTypes.Uri;
        } else if (error instanceof SieveCustomError) {
            return SieveErrorTypes.ByEmit;
        } else {
            return SieveErrorTypes.Unknown;
        }
    }

    private getBrowser(): SieveKnownBrowser {
        const userAgent: string = navigator.userAgent;

        if (userAgent.indexOf("Firefox") > -1) {
            return SieveKnownBrowsers.Firefox;
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            return SieveKnownBrowsers.Opera;
        } else if (userAgent.indexOf("Trident") > -1) {
            return SieveKnownBrowsers.InternerExplorer;
        } else if (userAgent.indexOf("Edge") > -1) {
            return SieveKnownBrowsers.Edge;
        } else if (userAgent.indexOf("Chrome") > -1) {
            return SieveKnownBrowsers.Chrome;
        } else if (userAgent.indexOf("Safari") > -1) {
            return SieveKnownBrowsers.Safari;
        } else {
            return SieveKnownBrowsers.Unknown;
        }
    }

    private getOS(): SieveKnownOS {
        const userAgent: string = navigator.userAgent;

        if (userAgent.indexOf("Win") > -1) {
            return SieveKnownOSs.Windows;
        } else if (userAgent.indexOf("Mac") > -1) {
            return SieveKnownOSs.MacOS;
        } else if (userAgent.indexOf("X11") > -1) {
            return SieveKnownOSs.Unix;
        } else if (userAgent.indexOf("Linux") > -1) {
            return SieveKnownOSs.Linux;
        } else if (/Android/i.test(userAgent)) {
            return SieveKnownOSs.Android;
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return SieveKnownOSs.iOS;
        } else {
            return SieveKnownOSs.Unknown;
        }
    }

    private getScreenOrientation(): SieveScreenOrientation {
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;

        if (width === height) {
            return SieveScreenOrientations.Square;
        } else if (width > height) {
            return SieveScreenOrientations.Landscape;
        } else if (width < height) {
            return SieveScreenOrientations.Portrait;
        } else {
            return SieveScreenOrientations.Unknown;
        }
    }

    private isMobile(): boolean {
        return /android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
            .test(navigator.userAgent);
    }

    private hasMessageLimitedByRule(errorMessageRules: ErrorMessageRule[], message: string) {
        return errorMessageRules
            .map((errorMessageRule: ErrorMessageRule): RegExp => {
                return typeof errorMessageRule === "string"
                    ? new RegExp(errorMessageRule)
                    : errorMessageRule;
            })
            .some((errorMessageRule: RegExp) => errorMessageRule.test(message));
    }

    private hasBannedMessage(message: string): boolean {
        return this.hasMessageLimitedByRule(this._excludeMessages, message);
    }

    private hasPanicMessage(message: string): boolean {
        return this.hasMessageLimitedByRule(this._panicMessages, message);
    }

    private handleOnError(event: ErrorEvent, meta?: Dictionary): void {
        if (this._preventErrorsDefault) {
            event.preventDefault();
        }

        const { filename, lineno, colno, error, target } = event;

        const errorType = this.getErrorType(error);
        const message: string = error.message;

        if (this._excludeTypes.includes(errorType)) {
            this.debugWarn(`Sieve excluded error with type "${errorType}" by exclusion list`);
            return;
        }

        if (this.hasBannedMessage(message)) {
            this.debugWarn(`Sieve excluded error which contain message "${errorType}" by exclusion list`);
            return;
        }

        if (this._excludeBrowsers.includes(this._browser)) {
            this.debugWarn(`Sieve excluded error for browsers "${this._browser}" by exclusion list`);
            return;
        }

        if (this._excludeMobile && this._isMobile) {
            this.debugWarn(`Sieve excluded mobile platform. This log will be excluded`);
            return;
        }

        if (this._excludeDesktop && !this._isMobile) {
            this.debugWarn(`Sieve excluded desktop platform. This log will be excluded`);
            return;
        }

        const trace: SieveResponseResolutions[] = this._trace;
        const currentTime: number = Date.now();
        const lastErrorTimestamp: number = this._lastErrorTimestamp;
        const isFirstTraceItem: boolean = !trace.length;
        const timeDelta: number = isFirstTraceItem ? 0 : currentTime - lastErrorTimestamp;
        const customDataKey: string = Sieve._customDataKey;
        const hasPanic: boolean = this.hasPanicMessage(message);

        const customData: Nullable<Dictionary> = event.hasOwnProperty(customDataKey)
            ? event[customDataKey]
            : null;

        const errorData: SieveResponseResolutions = this.applyResolution({
            sign: this._sign,
            hasPanic,
            customData,
            url: window.location.href,
            errorGeneralData: {
                message,
                fileName: filename,
                line: lineno,
                column: colno,
                type: errorType,
            },
            errorTargetData: {
                targetName: this.getTargetName(target),
                targetHtmlClassNames: this.getTargetHTMLClassNames(target),
                targetHtmlId: this.getTargetHTMLId(target),
            },
            viewportData: {
                width: window.innerWidth,
                height: window.innerHeight,
                orientation: this.getScreenOrientation(),
            },
            timeData: {
                timestamp: currentTime,
                timeDelta,
            },
            platformData: {
                software: {
                    browser: this._browser,
                    os: this._os,
                    isMobile: this._isMobile,
                    lang: navigator.language,
                },
                hardware: {
                    RAM: navigator.deviceMemory,
                },
            },
        });

        this.onError.emit(errorData);

        this.addToTrace(errorData);

        this._lastErrorTimestamp = currentTime;

        if (!hasPanic) return;

        this.onPanic.emit(errorData);

        if (this.hasPanicAutoReportTrigger()) {
            this.onAutoReport.emit(this.report);
        }
    }

    private addToTrace(errorData: SieveResponseResolutions): void {
        this._trace.push(errorData);
        this._countNewErrorsBeforeReport += 1;

        if (!this.hasErrorsQuantityAutoReportTrigger()) return;

        const autoReportTrigger = this.getAutoReportTriggerByType(Sieve.AutoReportTriggerTypes.ErrorsQuantity);

        if (this._countNewErrorsBeforeReport >= autoReportTrigger.value) {
            this.onAutoReport.emit(this.report);
        }
    }

    private applyResolution(innerReport: SieveErrorDataInnerReport): SieveResponseResolutions {
        switch (this._responseResolution) {
            case SieveResponseResolutionTypes.High:
                return new SieveResponseHighResolution(
                    innerReport.sign,
                    innerReport.hasPanic,
                    innerReport.errorGeneralData,
                    innerReport.customData,
                    innerReport.url,
                    innerReport.platformData,
                    innerReport.timeData,
                    innerReport.viewportData,
                    innerReport.errorTargetData,
                );
            case SieveResponseResolutionTypes.Medium:
                return new SieveResponseMediumResolution(
                    innerReport.sign,
                    innerReport.hasPanic,
                    innerReport.errorGeneralData,
                    innerReport.customData,
                    innerReport.url,
                    innerReport.timeData,
                    innerReport.errorTargetData,
                );
            case SieveResponseResolutionTypes.Low:
            case SieveResponseResolutionTypes.Unknown:
            default:
                return new SieveResponseLowResolution(
                    innerReport.sign,
                    innerReport.hasPanic,
                    innerReport.errorGeneralData,
                    innerReport.customData,
                    innerReport.url,
                    innerReport.timeData.timestamp,
                );
        }
    }

    private getTargetName(target: EventTarget): Nullable<string> {
        if (target instanceof HTMLElement) {
            return target.tagName.toLowerCase();
        } else if (target instanceof Window) {
            return "window";
        } else {
            return null;
        }
    }

    private getTargetHTMLClassNames(target: EventTarget): string[] {
        if (target instanceof HTMLElement) {
            const targetHtml = target as HTMLElement;
            return Array.from(targetHtml.classList);
        }
        return [];
    }

    private getTargetHTMLId(target: EventTarget): Nullable<string> {
        if (target instanceof HTMLElement) {
            const targetHtml = target as HTMLElement;
            return targetHtml.id;
        }
        return null;
    }

    private debugWarn(message: string) {
        if (!this._debug) return;
        console.warn(message);
    }

    private getPlatformData(): void {
        this._os = this.getOS();
        this._browser = this.getBrowser();
        this._isMobile = this.isMobile();
    }

    private hasTimeIntervalAutoReportTrigger(): boolean {
        if (!this._autoReportTriggers) return false;

        return Boolean(this.getAutoReportTriggerByType(Sieve.AutoReportTriggerTypes.TimeInterval));
    }

    private hasPanicAutoReportTrigger(): boolean {
        if (!this._autoReportTriggers) return false;

        return Boolean(this.getAutoReportTriggerByType(Sieve.AutoReportTriggerTypes.Panic));
    }

    private hasErrorsQuantityAutoReportTrigger(): boolean {
        if (!this._autoReportTriggers) return false;

        return Boolean(this.getAutoReportTriggerByType(Sieve.AutoReportTriggerTypes.ErrorsQuantity));
    }

    private getAutoReportTriggerByType(type: AutoReportTriggerType): Nullable<SieveAutoReportTrigger> {
        if (!this._autoReportTriggers) return null;

        return this._autoReportTriggers
            .find((trigger) => trigger.type === type);
    }

    public setResponseResolution(resolution: SieveResponseResolution): void {
        this._responseResolution = resolution;
    }

    public init(config: Nullable<SieveInitConfig>): void {
        if (this._isInit) return;

        if (config) {
            this.applyConfig(config);
        }

        this.getPlatformData();
        this.listenErrors();

        if (this.hasTimeIntervalAutoReportTrigger()) {
            const timeIntervalAutoReportTrigger = this.getAutoReportTriggerByType(Sieve.AutoReportTriggerTypes.TimeInterval);
            this._autoReportTimer = setInterval(() => {
                this.onAutoReport.emit(this.report);
            }, timeIntervalAutoReportTrigger.value);
        }

        this._isInit = true;
    }

    public emitError(config: SieveEmitErrorConfig): void {
        const message: string = config.message || "no error description";

        const customErrorEvent: ErrorEvent = new ErrorEvent("error", {
            message,
            error: new SieveCustomError(message),
            lineno: config.line || 0,
            colno: config.column || 0,
            filename: config.fileName || "",
        });

        if (config.customData && is.jsonLike(config.customData)) {
            customErrorEvent[Sieve._customDataKey] = config.customData;
        }

        window.dispatchEvent(customErrorEvent);
    }

    public filterTrace(mask: SieveErrorType): SieveResponseResolutions[] {
        return this.trace
            .filter((item: SieveResponseResolutions): boolean => item.errorGeneralData.type === mask);
    }

    public get trace(): SieveResponseResolutions[] {
        return [...this._trace];
    }

    public get report(): SieveReport {
        let responseTrace: SieveResponseResolutions[] = this.trace;

        if (this._reportTraceIndex === 0) {
            this._reportTraceIndex = responseTrace.length;
        } else {
            responseTrace = responseTrace.slice(this._reportTraceIndex);
            this._reportTraceIndex += responseTrace.length;
        }

        const harmonyAverageMap = (item: SieveResponseResolutions): number => {
            item = item as ISieveResponseMediumResolution | ISieveResponseHighResolution;
            return item.timeData.timeDelta;
        };

        const averageDeltaTime: number = this._responseResolution === Sieve.ResponseResolutions.Low || !responseTrace.length
            ? 0
            : Math.round(getHarmonyAverage(responseTrace.slice(1).map(harmonyAverageMap)));

        this._countNewErrorsBeforeReport = 0;

        return {
            errorsTotalAmount: responseTrace.length,
            resolution: this._responseResolution,
            newErrors: responseTrace,
            hasPanic: responseTrace.some((responseResolution: SieveResponseResolutions) => responseResolution.hasPanic),
            sign: this._sign,
            host: window.location.origin,
            averageDeltaTime,
        };
    }
}