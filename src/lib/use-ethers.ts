import { RPC_URL } from "@/globals";
import { BigNumber, ethers } from "ethers"

export const useEthers = () => {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const getBalanceOf = async (address: string): Promise<BigNumber> => {
        return await provider.getBalance(address);
    }

    const sendTransaction = async (transaction: string) => {
        return await provider.sendTransaction(transaction);
    }

    return {
        getBalanceOf,
        sendTransaction
    }
}