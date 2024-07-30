export const executeLimitOrderAction = `(async () => {
  const encodeSignature = (signature) => {
    const jsonSignature = JSON.parse(signature);
    jsonSignature.r = '0x' + jsonSignature.r.substring(2);
    jsonSignature.s = '0x' + jsonSignature.s;
    return ethers.utils.joinSignature(jsonSignature);
  };
  const txToMsg = (tx) => {
    return ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.arrayify(ethers.utils.serializeTransaction(tx))
      )
    );
  };
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
        recipient: ethAddress,
        deadline: parsed.deadline,
        amountIn: parsed.amountIn, 
        amountOutMinimum: parsed.amountOutMinimum,
        sqrtPriceLimitX96: '0'
      };

  

  const swapRouterInterface = new ethers.utils.Interface(['function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)']);

  const data = swapRouterInterface.encodeFunctionData('exactInputSingle', [params]);
  const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');

  const sigName = "sig4";
  const txn = {
    to: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    value: 0,
    data,
    gasPrice: await provider.getGasPrice(),
    gasLimit: 400000,
    nonce: await provider.getTransactionCount(ethAddress, 'latest'),
  }

  const toSign = txToMsg(txn);

  const signature = await Lit.Actions.signAndCombineEcdsa({
    toSign: toSign,
    publicKey: publicKey?.startsWith('0x')
      ? publicKey.split('0x')[1]
      : publicKey,
    sigName,
  });

  //const chainId = await provider.getNetwork().then(network => network.chainId);
  //const v = parsedSig.v + (chainId * 2 + 35);

  const signedTx = ethers.utils.serializeTransaction(txn, encodeSignature(signature));

  console.log('signedTx ===>', signedTx);

  let res = await Lit.Actions.runOnce({ waitForResponse: true, name: "txnSender" }, async () => {
    try {
      const tx = await provider.sendTransaction(signedTx);
      return tx; // return the tx to be broadcast to all other nodes
    } catch (e) {
      return JSON.stringify(e);
    }
  });

  console.log('res ===>', JSON.stringify(res.message));
    console.log('res ===>', JSON.stringify(res.transaction));
  console.log('res ===>', JSON.stringify(res.receipt));


  Lit.Actions.setResponse({ response: JSON.stringify({res}) });
})();`