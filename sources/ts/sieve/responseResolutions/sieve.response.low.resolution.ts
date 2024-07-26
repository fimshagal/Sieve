import {
    Dictionary,
    ISieveResponseLowResolution,
    Nullable,
    SieveErrorGeneralData,
} from "../lib";
import { ResponseResolution } from "./response.resolution";

export class SieveResponseLowResolution extends ResponseResolution implements ISieveResponseLowResolution {
    public readonly sign: string;
    public readonly hasPanic: boolean;
    public readonly errorGeneralData: SieveErrorGeneralData;
    public readonly customData: Nullable<Dictionary>;
    public readonly url: string;
    public readonly timestamp: number;

    constructor(
        sign: string,
        hasPanic: boolean,
        incomeErrorGeneralData: SieveErrorGeneralData,
        incomeCustomData: Nullable<Dictionary>,
        incomeUrl: string,
        incomeTimestamp: number,
    ) {
        super();
        this.sign = sign;
        this.hasPanic = hasPanic;
        this.errorGeneralData = incomeErrorGeneralData;
        this.customData = incomeCustomData;
        this.url = incomeUrl;
        this.timestamp = incomeTimestamp;
    }
}