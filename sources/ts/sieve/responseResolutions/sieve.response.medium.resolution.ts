import {
    Dictionary, ISieveResponseMediumResolution,
    Nullable,
    SieveErrorGeneralData,
    SieveErrorTargetData,
    SieveTimeData,
} from "../lib";
import { ResponseResolution } from "./response.resolution";

export class SieveResponseMediumResolution extends ResponseResolution implements ISieveResponseMediumResolution {
    public readonly sign: string;
    public readonly hasPanic: boolean;
    public readonly errorGeneralData: SieveErrorGeneralData;
    public readonly customData: Nullable<Dictionary>;
    public readonly url: string;
    public readonly timeData: SieveTimeData;
    public readonly errorTargetData: SieveErrorTargetData;

    constructor(
        sign: string,
        hasPanic: boolean,
        incomeErrorGeneralData: SieveErrorGeneralData,
        incomeCustomData: Nullable<Dictionary>,
        incomeUrl: string,
        incomeTimeData: SieveTimeData,
        incomeErrorTargetData: SieveErrorTargetData,
    ) {
        super();
        this.sign = sign;
        this.hasPanic = hasPanic;
        this.errorGeneralData = incomeErrorGeneralData;
        this.customData = incomeCustomData;
        this.url = incomeUrl;
        this.timeData = incomeTimeData;
        this.errorTargetData = incomeErrorTargetData;
    }
}