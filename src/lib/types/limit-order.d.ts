import { Encryption } from "./encryption";

export interface LimitOrder {
    tokenOut: string;
    fee: number;
    amountIn: string;
    amountOutMinimum: string;
    deadline: string;
    encryption?: Encryption;
  }