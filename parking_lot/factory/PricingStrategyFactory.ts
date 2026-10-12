import { PricingStrategy } from "../strategy/pricing/PricingStrategy";
import { TimeBasedPricing } from "../strategy/pricing/TimeBasedPricing";
import { EventBasedPricing } from "../strategy/pricing/EventBasedPricing";
import { PricingStrategyType } from "../enums/PricingStrategyType";

export class PricingStrategyFactory {
    public static chooseAlgo(pricingStrategyType: PricingStrategyType): PricingStrategy {
        switch (pricingStrategyType) {
            case PricingStrategyType.TIME_BASED:
                return new TimeBasedPricing();
            case PricingStrategyType.EVNET_BASED:
                return new EventBasedPricing();
            default:
                throw new Error(`Invalid pricing type: ${pricingStrategyType}`);
        }
    }
}