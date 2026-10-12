import { PaymentStrategy } from "../strategy/payment/PaymentStrategy";
import { UpiPayment } from "../strategy/payment/UpiPayment";
import { CardPayment } from "../strategy/payment/CardPayment";
import { CashPayment } from "../strategy/payment/CashPayment";
import { PaymentMode } from "../enums/PaymentMode";

export class PaymentStrategyFactory {
    public static choosePayment(paymentMode: PaymentMode): PaymentStrategy {
        switch (paymentMode) {
            case PaymentMode.UPI:
                return new UpiPayment();
            case PaymentMode.CARD:
                return new CardPayment();
            case PaymentMode.CASH:
                return new CashPayment();
            default:
                throw new Error(`Invalid payment type: ${paymentMode}`);
        }
    }
}