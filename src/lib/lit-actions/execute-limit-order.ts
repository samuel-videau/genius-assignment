export const executeLimitOrderAction = `(async () => {
  const resp = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });

  const parsed = JSON.parse(resp);

  const params = {
        tokenIn: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        tokenOut: parsed.tokenOut,
        fee: parsed.fee,
        recipient: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
        deadline: parsed.deadline,
        amountIn: '0', 
        amountOutMinimum: parsed.amountOutMinimum,
        sqrtPriceLimitX96: '0'
      };

  const swapRouterInterface = new ethers.utils.Interface(['function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)']);

  const data = swapRouterInterface.encodeFunctionData('exactInputSingle', [params]);
  const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');

  const sigName = "sig4";
  const txn = {
    to: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    value: ethers.BigNumber.from(parsed.amountIn),
    data,
    gasPrice: await provider.getGasPrice(),
    nonce: 0
  }

  const serializedTx = ethers.utils.serializeTransaction(txn);
  let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(serializedTx));
  // encode the message into an uint8array for signing
  const toSign = await new TextEncoder().encode(hash);

  const signature = await Lit.Actions.signAndCombineEcdsa({
      toSign,
      publicKey,
      sigName,
  });

  Lit.Actions.setResponse({ response: JSON.stringify({params, parsed}) });
})();`