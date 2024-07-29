import { RPC_URL, UNI_NFP_MANAGER_ADR, UNI_POOL_ADR } from "@/globals";
import { Contract, Signer, ethers } from "ethers"
import { UNIPoolAbi } from "./abis/uni-v3-pool.abi";
import { UNINfpManagerAbi } from "./abis/uni-v3-nfp-manager.abi";
import { TransactionDescription } from "ethers/lib/utils";

const useUNI = () => {

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const getPoolContract = (signer?: Signer): Contract => {
        return new Contract(UNI_POOL_ADR, UNIPoolAbi, signer || provider);
    }

    const getNfpManagerContract = (signer?: Signer): Contract => {
        return new Contract(UNI_NFP_MANAGER_ADR, UNINfpManagerAbi, signer || provider);
    }

    const createLimitOrder = async (
        token0Address: string,
        token1Address: string,
        fee: number,
        amountIn: string,
        tickLower: number,
        signer: Signer
      ): Promise<TransactionDescription> => {
        try {
            const poolContract = getPoolContract(signer);
            const nfpManagerContract = getNfpManagerContract(signer);
          // Fetch current pool state
          const [slot0, tickSpacing] = await Promise.all([
            poolContract.slot0(),
            poolContract.tickSpacing(),
          ]);
      
          const currentTick = slot0.tick;
          console.log(`Current tick: ${currentTick}`);
      
          // Ensure tickLower is a multiple of tickSpacing
          const adjustedTickLower = Math.floor(tickLower / tickSpacing) * tickSpacing;
          const tickUpper = adjustedTickLower + tickSpacing;
      
          console.log(`Creating limit order at tick range: ${adjustedTickLower} - ${tickUpper}`);
      
          // Prepare mint parameters
          const mintParams = {
            token0: token0Address,
            token1: token1Address,
            fee: fee,
            tickLower: adjustedTickLower,
            tickUpper: tickUpper,
            amount0Desired: amountIn,
            amount1Desired: amountIn, // Set both to amountIn, contract will use the correct one
            amount0Min: 0,
            amount1Min: 0,
            recipient: await signer.getAddress(),
            deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
          };
      
          // Execute mint transaction
          const tx = await nfpManagerContract.mint(mintParams, {
            gasLimit: 1000000, // Adjust as needed
          });
      
          console.log('Transaction sent:', tx);
      
          const receipt = await tx.wait();
          console.log('Transaction confirmed:', receipt.transactionHash);
      
          // Parse events to get minted position details
          const mintEvent = receipt.events?.find((e: { event: string; }) => e.event === 'IncreaseLiquidity');
          if (mintEvent) {
            console.log('Position minted:', {
              tokenId: mintEvent.args.tokenId.toString(),
              liquidity: mintEvent.args.liquidity.toString(),
              amount0: mintEvent.args.amount0.toString(),
              amount1: mintEvent.args.amount1.toString(),
            });
          }
      
          return receipt;
        } catch (error) {
          console.error('Error creating limit order:', error);
          throw error;
        }
      }
}
