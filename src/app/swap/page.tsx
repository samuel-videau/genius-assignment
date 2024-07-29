'use client'

import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useUniV3 } from '@/lib/use-uni-v3';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { UNI_TOKEN_ADR, WETH_ADR } from '@/globals';
import { useLit } from '@/lib/use-lit';
import { useLocalStorage } from '@/lib/use-local-storage';
import { LimitOrder } from '@/lib/types/limit-order';
import { useAppSelector } from '@/store/hooks';

const LimitOrderPage = () => {
  const [amountIn, setAmountIn] = useState('1');
  const [tokenWanted, setTokenWanted] = useState(UNI_TOKEN_ADR);
  const [priceWanted, setPriceWanted] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [initialised, setInitialised] = useState(false);

  const { getAmountOut, generateExactInputSingleETHForTokenBytecode } = useUniV3();
  const {encrypt, connect, signAndExecute} = useLit();
  const { addLimitOrder } = useLocalStorage();
  const user = useAppSelector((state) => state.user);

  const userAddress = '0x1234...5678'; // Replace with actual user address
  const ethBalance = '1.5 ETH'; // Replace with actual ETH balance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitOrder: LimitOrder = {
      tokenOut: tokenWanted,
      fee: 3000,
      amountIn: parseEther(amountIn).toString(),
      amountOutMinimum: parseEther(amountOut).toString(),
      deadline: (Date.now() + Number(timeLimit) * 60 * 1000).toString()
    }

    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ];

    await connect();
    const { ciphertext, dataToEncryptHash } = await encrypt(JSON.stringify(limitOrder), accessControlConditions);
    console.log(ciphertext, dataToEncryptHash);
    console.log(user.sessionSigs);
    await signAndExecute({ ciphertext, dataToEncryptHash }, user.sessionSigs);

    setOrders([...orders, limitOrder]);
    setTokenWanted('');
    setPriceWanted('');
    setAmountIn('');
    setAmountOut('');
    setTimeLimit('10');
  };

  const handleCancel = (index: number) => {
    setOrders(orders.filter((order, i) => i !== index));
  };

  useEffect(() => {
    const init = async () => {
      if (!amountIn) {
        setAmountIn('1');
      }

      if (!priceWanted) {
        const amountOut = await getAmountOut(parseEther('1').toString(), WETH_ADR, tokenWanted, 3000);
        setAmountOut(formatEther(amountOut));
        setPriceWanted((1 / Number(formatEther(amountOut))).toString());
      }
      if (!initialised) {
        setInitialised(true);
      }
    }

    if (tokenWanted) init();
  }, []);

  useEffect(() => {
    if (amountIn && priceWanted) {
      updateAmountOut();
    }
  }, [amountIn, priceWanted]);

  const updateAmountOut = async () => {
    console.log('Updating amount out');
    console.log((Number(amountIn) / Number(priceWanted)).toString())
    setAmountOut((Number(amountIn) / Number(priceWanted)).toString());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Uniswap Limit Orders</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Wallet className="mr-2" />
              <span>{userAddress}</span>
            </div>
            <div>{ethBalance}</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-8 p-4">
        {/* Order Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amountIn">
              Amount In (ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="amountIn"
              type="number"
              step="0.000000000000000001"
              placeholder="Enter amount in ETH"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tokenWanted">
              Token Wanted
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="tokenWanted"
              type="text"
              placeholder="Enter token address"
              value={tokenWanted}
              onChange={(e) => setTokenWanted(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priceWanted">
              Price Wanted
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="priceWanted"
              type="number"
              step="0.000000000000000001"
              placeholder="Enter desired price"
              value={priceWanted}
              onChange={(e) => setPriceWanted(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amountOut">
              Amount Out
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="amountOut"
              type="number"
              step="0.000000000000000001"
              placeholder="Calculated amount out"
              value={amountOut}
              disabled
              readOnly
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeLimit">
              Time Limit (minutes)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="timeLimit"
              type="number"
              placeholder="Enter time limit in minutes"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Order
            </button>
          </div>
        </form>

        {/* Order List */}
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Your Orders</h2>
          {orders.map((order, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <div>
                <p><strong>Token Wanted:</strong> {order.tokenOut}</p>
                <p><strong>Amount In:</strong> {order.amountIn} ETH</p>
                <p><strong>Amount Out:</strong> {order.amountOutMinimum}</p>
                <p><strong>Time Limit:</strong> {order.deadline}</p>
              </div>
              <button
                onClick={() => handleCancel(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LimitOrderPage;