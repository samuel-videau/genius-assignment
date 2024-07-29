import { RPC_URL, UNI_V3_FACTORY_ADR, UNI_V3_POOL_ADR, UNI_V3_QUOTER_ADR, UNI_V3_ROUTER_ADR, WETH_ADR } from "@/globals";
import { Contract, Signer, ethers } from "ethers"
import { UniV3RouterAbi } from "./abis/uni-v3-router.abi";
import { UniV3FactoryAbi } from "./abis/uni-v3-factory.abi";
import { UniV3PoolAbi } from "./abis/uni-v3-pool.abi";
import { uniV3QuoterAbi } from "./abis/uni-v3-quoter.abi";
import { parseEther } from "ethers/lib/utils";

export const useUniV3 = () => {

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const getRouterContract = (signer?: Signer): Contract => {
        return new Contract(UNI_V3_ROUTER_ADR, UniV3RouterAbi, signer || provider);
    }

    const getFactoryContract = (): Contract => {
        return new Contract(UNI_V3_FACTORY_ADR, UniV3FactoryAbi, provider);
    }

    const getPoolContract = (poolAddress: string): Contract => {
      return new Contract(poolAddress, UniV3PoolAbi, provider);
    }

    const getQuoterContract = (): Contract => {
      console.log(UNI_V3_QUOTER_ADR);
      return new Contract(UNI_V3_QUOTER_ADR, uniV3QuoterAbi, provider);
    }

    const fetchQuote = async (
      amountA: bigint | string,
      tokenIn: string,
      tokenOut: string,
      fee: number
    ): Promise<bigint> => {
      const quoterContract = getQuoterContract();
      const params = {
        tokenIn,
        tokenOut,
        fee,
        amountIn: amountA.toString(),
        sqrtPriceLimitX96: 0
      };
      const { amountOut } = await quoterContract.callStatic.quoteExactInputSingle(params);
      return BigInt(amountOut.toString());
    };

    const getPoolAddress = async (
      tokenA: string,
      tokenB: string,
      fee: number
    ): Promise<string> => {
      const factoryContract = getFactoryContract();
      return await factoryContract.getPool(tokenA, tokenB, fee);
    };
    
    const fetchPoolState = async (poolAddress: string): Promise<{ 
      liquidity: bigint; 
      sqrtPriceX96: bigint; 
      tick: number 
    }> => {
      const poolContract = getPoolContract(poolAddress);
      const [liquidity, slot0] = await Promise.all([
        poolContract.liquidity(),
        poolContract.slot0(),
      ]);
      return { 
        liquidity: BigInt(liquidity.toString()),
        sqrtPriceX96: BigInt(slot0.sqrtPriceX96.toString()),
        tick: slot0.tick
      };
    };
    
    const getAmountOut = async (
      amountIn: bigint | string,
      tokenIn: string,
      tokenOut: string,
      fee: number
    ): Promise<bigint> => {
      const quoterContract = getQuoterContract();

      console.log(tokenIn, tokenOut, fee, amountIn.toString());
      const params = {
        tokenIn,
        tokenOut,
        fee,
        amountIn: parseEther('1').toString(),
        sqrtPriceLimitX96: 0
      };
      const { amountOut } = await quoterContract.callStatic.quoteExactInputSingle(params);
      return BigInt(amountOut.toString());
    };
    
    const getAmountIn = async (
      amountOut: bigint | string,
      tokenIn: string,
      tokenOut: string,
      fee: number
    ): Promise<bigint> => {
      const quoterContract = getQuoterContract();
      const params = {
        tokenIn,
        tokenOut,
        fee,
        amountOut: amountOut.toString(),
        sqrtPriceLimitX96: 0
      };
      const { amountIn } = await quoterContract.callStatic.quoteExactOutputSingle(params);
      return BigInt(amountIn.toString());
    };

    const generateUniswapV3SwapBytecode = (
      tokenIn: string,
      tokenOut: string,
      fee: number,
      amountIn: string,
      amountOutMinimum: string,
      recipient: string,
      deadline: number
    ): string => {
      const swapRouterInterface = new ethers.utils.Interface(UniV3RouterAbi);
    
      const params = {
        tokenIn,
        tokenOut,
        fee,
        recipient,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96: 0
      };
    
      const bytecode = swapRouterInterface.encodeFunctionData('exactInputSingle', [params]);
      return bytecode;
    }

    const generateExactInputSingleETHForTokenBytecode = (
      tokenOut: string,
      fee: number,
      deadline: number,
      amountOutMinimum: string,
      sqrtPriceLimitX96: string = '0'
    ): string => {
      const swapRouterInterface = new ethers.utils.Interface(UniV3RouterAbi);

      const params = {
        tokenIn: WETH_ADR,
        tokenOut,
        fee,
        recipient: UNI_V3_ROUTER_ADR,
        deadline,
        amountIn: '0', // This will be filled in by the value sent with the transaction
        amountOutMinimum,
        sqrtPriceLimitX96
      };
      console.log(params)
      return swapRouterInterface.encodeFunctionData('exactInputSingle', [params]);
    };

    return {
        fetchQuote,
        getPoolAddress,
        fetchPoolState,
        getAmountOut,
        getAmountIn,
        generateUniswapV3SwapBytecode,
        generateExactInputSingleETHForTokenBytecode
    }
}