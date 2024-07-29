export interface LimitOrder {
    tokenOut: string;
    amountIn: string;
    amountOutMin: string;
    encryption?: {
      ciphertext: string, 
      dataToEncryptHash: string
    };
  }