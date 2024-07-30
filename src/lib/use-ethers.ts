import { RPC_URL } from "@/globals";
import { BigNumber, ethers } from "ethers"
import { erc20Abi } from "./abis/erc20.abi";

export const useEthers = () => {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const getBalanceOf = async (address: string): Promise<BigNumber> => {
        return await provider.getBalance(address);
    }

    const sendTransaction = async (transaction: string) => {
        return await provider.sendTransaction(transaction);
    }

    const getTokenInfo = async (tokenAddress: string): Promise<{name: string, symbol: string}> => {
        const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        const [name, symbol] = await Promise.all([
            contract.name(),
            contract.symbol()
        ]);
        return { name, symbol };
    }

    return {
        getBalanceOf,
        sendTransaction,
        getTokenInfo
    }
}