import {
    Dictionary,
    ISieveResponseHighResolution,
    Nullable,
    SieveErrorGeneralData, SieveErrorTargetData,
    SievePlatformData, SieveTimeData, SieveViewportData
} from "../lib";
import { ResponseResolution } from "./response.resolution";

export class SieveResponseHighResolution extends ResponseResolution implements ISieveResponseHighResolution {
    public readonly sign: string;
    public readonly hasPanic: boolean;
    public readonly errorGeneralData: SieveErrorGeneralData;
    public readonly customData: Nullable<Dictionary>;
    public readonly url: string;
    public readonly platformData: SievePlatformData;
    public readonly timeData: SieveTimeData;
    public readonly viewportData: SieveViewportData;
    public readonly errorTargetData: SieveErrorTargetData;

    constructor(
        sign: string,
        hasPanic: boolean,
        incomeErrorGeneralData: SieveErrorGeneralData,
        incomeCustomData: Nullable<Dictionary>,
        incomeUrl: string,
        incomePlatformData: SievePlatformData,
        incomeTimeData: SieveTimeData,
        incomeViewportData: SieveViewportData,
        incomeErrorTargetData: SieveErrorTargetData,
    ) {
        super();
        this.sign = sign;
        this.hasPanic = hasPanic;
        this.errorGeneralData = incomeErrorGeneralData;
        this.customData = incomeCustomData;
        this.url = incomeUrl;
        this.platformData = incomePlatformData;
        this.timeData = incomeTimeData;
        this.viewportData = incomeViewportData;
        this.errorTargetData = incomeErrorTargetData;
    }
}