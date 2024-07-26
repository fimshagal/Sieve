/* Common generics */

import {SieveCustomError} from "./sieve.custom.error";
import {SieveAutoReportTrigger} from "./sieve.auto.report.trigger";

export type Dictionary<T = any> = {
    [key: string | symbol]: T;
};

export type Nullable<T> = T | null;

/* Common generics end */

//

/* Interfaces */

export interface ISieve {
    init(config: Nullable<SieveInitConfig>): void;
    setResponseResolution(resolution: SieveResponseResolution): void;
    emitError(message: SieveEmitErrorConfig): void;
    filterTrace(mask: SieveErrorType): SieveResponseResolutions[];
}

export interface IResponseResolution {
    toString(): string;
}

export interface ISieveAutoReportTrigger {
    type: AutoReportTriggerType;
    value: number;
}

export interface ISieveResponseLowResolution extends IResponseResolution {
    sign: string;
    hasPanic: boolean;
    errorGeneralData: SieveErrorGeneralData,
    customData: Nullable<Dictionary>;
    timestamp: number;
    url: string;
}

export interface ISieveResponseMediumResolution extends IResponseResolution {
    sign: string;
    hasPanic: boolean;
    errorGeneralData: SieveErrorGeneralData,
    customData: Nullable<Dictionary>;
    url: string;
    timeData: SieveTimeData;
    errorTargetData: SieveErrorTargetData;
}

export interface ISieveResponseHighResolution extends IResponseResolution {
    sign: string;
    hasPanic: boolean;
    errorGeneralData: SieveErrorGeneralData,
    customData: Nullable<Dictionary>;
    url: string;
    platformData: SievePlatformData;
    timeData: SieveTimeData;
    viewportData: SieveViewportData;
    errorTargetData: SieveErrorTargetData;
}

/* Interfaces end */

//

/* Configs */

export interface SieveInitConfig {
    sign?: string;
    preventErrorsDefault?: boolean;
    target?: SieveTarget;
    onError?: (data: SieveResponseResolutions) => void;
    onPanic?: (data: SieveResponseResolutions) => void;
    onAutoReport?: (data: SieveReport) => void;
    excludeTypes?: SieveErrorType[];
    excludeMessages?: ErrorMessageRule[];
    panicMessages?: ErrorMessageRule[];
    excludeDesktop?: boolean;
    excludeMobile?: boolean;
    excludeBrowsers?: SieveKnownBrowser[];
    debug?: boolean;
    responseResolution?: SieveResponseResolution;
    autoReportTriggers?: SieveAutoReportTrigger[];
}

export interface SieveErrorDataInnerReport {
    sign: string;
    hasPanic: boolean;
    errorGeneralData: SieveErrorGeneralData,
    customData: Nullable<Dictionary>;
    url: string;
    platformData: SievePlatformData;
    timeData: SieveTimeData;
    viewportData: SieveViewportData;
    errorTargetData: SieveErrorTargetData;
}

export interface SieveErrorGeneralData {
    message: string;
    type: SieveErrorType;
    fileName: string;
    line: number;
    column: number;
}

export interface SieveErrorTargetData {
    targetName: Nullable<string>;
    targetHtmlClassNames: string[];
    targetHtmlId: Nullable<string>;
}

export interface SieveViewportData {
    width: number;
    height: number;
    orientation: SieveScreenOrientation;
}

export interface SieveTimeData {
    timestamp: number;
    timeDelta: number;
}

export interface SievePlatformData {
    software: SievePlatformSoftwareData;
    hardware: SievePlatformHardwareData;
}

export interface SievePlatformHardwareData {
    RAM: number;
}

export interface SievePlatformSoftwareData {
    browser: SieveKnownBrowser;
    os: SieveKnownOS;
    isMobile: boolean;
    lang: string;
}

export interface SieveEmitErrorConfig {
    message?: string;
    fileName?: string;
    line?: number;
    column?: number;
    customData?: Dictionary;
}

export interface SieveReport {
    errorsTotalAmount: number;
    resolution: SieveResponseResolution;
    newErrors: SieveResponseResolutions[];
    sign: string;
    hasPanic: boolean;
    host: string;
    averageDeltaTime: number;
}


/* Configs end */

//

/* Types */

export type SieveUnknownType = "Unknown";
export type SieveTarget = Window | HTMLElement;
export type SieveErrorType = "Reference" | "Syntax" | "Type" | "Range" | "Eval" | "Uri" | "ByEmit" | SieveUnknownType;
export type SieveKnownBrowser = SieveUnknownType | "Firefox" | "Opera" | "Internet Explorer" | "Edge" | "Chrome" | "Safari";
export type SieveKnownOS = SieveUnknownType | "Windows" | "MacOS" | "Unix" | "Linux" | "Android" | "iOS";
export type SieveScreenOrientation = SieveUnknownType | "Landscape" | "Portrait" | "Square";
export type SieveResponseResolution = SieveUnknownType | "Low" | "Medium" | "High";
export type AutoReportTriggerType = SieveUnknownType | "TimeInterval" | "ErrorsQuantity" | "Panic";
export type SieveResponseResolutions = ISieveResponseLowResolution | ISieveResponseMediumResolution | ISieveResponseHighResolution;
export type ErrorMessageRule = string | RegExp;

/* Types end */

//

/* Extends */

export interface Navigator {
    deviceMemory?: number;
    language?: string;
    userAgent?: string;
}

/* Extends end */