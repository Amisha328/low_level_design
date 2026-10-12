import { SplitStrategy } from '../strategy/split/SplitStrategy';
import { SplitType } from "../enums/SplitType";
import { EqualSplitStrategy } from '../strategy/split/EqualSplitStrategy';
import { PercentageSplitStrategy } from '../strategy/split/PercentageSplitStrategy';
import { ExactSplitStrategy } from '../strategy/split/ExactSplitStrategy';

export class SplitStrategyFactory {
    public static getSplitStrategy(splitType: SplitType): SplitStrategy {
        switch(splitType){
            case SplitType.EQUAL:
                return new EqualSplitStrategy();
            case SplitType.PERCENTAGE:
                return new PercentageSplitStrategy();
            case SplitType.EXACT:
                return new ExactSplitStrategy();
            default:
               throw new Error(`Unsupported split type: ${splitType}`);
        }
    }
}