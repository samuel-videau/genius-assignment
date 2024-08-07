'use client';

import React, { useEffect, useState } from 'react';
import { Loader, Wallet } from 'lucide-react';
import { formatEther, parseEther } from 'ethers/lib/utils';

import { useUniV3 } from '@/lib/use-uni-v3';
import { UNI_TOKEN_ADR, WETH_ADR } from '@/globals';
import { useLit } from '@/lib/use-lit';
import { STORAGE_KEY, useLocalStorage } from '@/lib/use-local-storage';
import { LimitOrder } from '@/lib/types/limit-order';
import { useAppSelector } from '@/store/hooks';
import { useEthers } from '@/lib/use-ethers';
import { Encryption } from '@/lib/types/encryption';

const LoadingOverlay = () => (
  <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
      <Loader className="animate-spin mr-3" />
      <span className="text-lg font-semibold">Loading...</span>
    </div>
  </div>
);

const LimitOrderPage = () => {
  const [amountIn, setAmountIn] = useState('1');
  const [tokenWanted, setTokenWanted] = useState(UNI_TOKEN_ADR);
  const [formTokenInfo, setFormTokenInfo] = useState({ name: '', symbol: '' });
  const [orderTokenInfo, setOrderTokenInfo] = useState({ name: '', symbol: '' });
  const [priceWanted, setPriceWanted] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');
  const [order, setOrder] = useState<LimitOrder | null>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const { getAmountOut } = useUniV3();
  const { encrypt, connect, signAndExecute } = useLit();
  const { setValue, getValue } = useLocalStorage();
  const { getBalanceOf, getTokenInfo } = useEthers();
  const user = useAppSelector((state) => state.user);

  const encryptOrder = async (e: React.FormEvent) => {
    setIsLoading(true);

    try {
      e.preventDefault();
      const limitOrder: LimitOrder = {
        tokenOut: tokenWanted,
        fee: 3000,
        amountIn: parseEther(Number(amountIn).toFixed(17)).toString(),
        amountOutMinimum: parseEther(Number(amountOut).toFixed(17)).toString(),
        deadline: (Date.now() + Number(timeLimit) * 60 * 1000).toString(),
      };

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
      limitOrder.encryption = await encrypt(JSON.stringify(limitOrder), accessControlConditions);

      setValue(STORAGE_KEY.LIMIT_ORDER, JSON.stringify(limitOrder));
      setOrder(limitOrder);
      setTokenWanted('');
      setPriceWanted('');
      setAmountIn('');
      setAmountOut('');
      setTimeLimit('10');
    } finally {
      setIsLoading(false);
    }
  };

  const executeOrder = async (encryption: Encryption) => {
    setIsLoading(true);
    try {
      await connect();
      const res = await signAndExecute(
        encryption,
        user.sessionSigs,
        user.pkp?.publicKey || '',
        user.pkp?.ethAddress || '',
      );
      console.log(res);
      // Handle successful execution here (e.g., show a success message)
    } catch (error) {
      console.error('Error executing order:', error);
      // Handle error here (e.g., show an error message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOrder(null);
    setValue(STORAGE_KEY.LIMIT_ORDER, '');
  };

  useEffect(() => {
    const order = getValue(STORAGE_KEY.LIMIT_ORDER);
    if (order) {
      setOrder(JSON.parse(order));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!amountIn) {
        setAmountIn('1');
      }

      if (!priceWanted) {
        const amountOut = await getAmountOut(
          parseEther('1').toString(),
          WETH_ADR,
          tokenWanted,
          3000,
        );
        setAmountOut(formatEther(amountOut));
        setPriceWanted((1 / Number(formatEther(amountOut))).toString());
      }

      const tokenInfo = await getTokenInfo(tokenWanted);
      if (tokenInfo) {
        setFormTokenInfo({ name: tokenInfo.name, symbol: tokenInfo.symbol });
      }
    };

    if (tokenWanted) init();
  }, [tokenWanted]);

  useEffect(() => {
    const init = async () => {
      if (order?.tokenOut) {
        const tokenInfo = await getTokenInfo(order.tokenOut);
        if (tokenInfo) {
          setOrderTokenInfo({ name: tokenInfo.name, symbol: tokenInfo.symbol });
        }
      }
    };

    init();
  }, [order]);

  useEffect(() => {
    const initBalance = async () => {
      if (user.pkp?.ethAddress) {
        const balance = await getBalanceOf(user.pkp?.ethAddress);
        setUserBalance(formatEther(balance));
      }
    };

    initBalance();
  }, [user.pkp?.ethAddress]);

  useEffect(() => {
    if (amountIn && priceWanted) {
      updateAmountOut();
    }
  }, [amountIn, priceWanted]);

  const updateAmountOut = async () => {
    console.log('Updating amount out');
    console.log((Number(amountIn) / Number(priceWanted)).toString());
    setAmountOut((Number(amountIn) / Number(priceWanted)).toString());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <LoadingOverlay />}
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Uniswap Limit Orders</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Wallet className="mr-2" />
              <span>{user.pkp?.ethAddress}</span>
            </div>
            <div>{userBalance}</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-8 p-4">
        {/* Order Form */}
        <form onSubmit={encryptOrder} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
              Token Wanted ${formTokenInfo.name}
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
              Price Wanted (ETH)
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
              Amount Out ${formTokenInfo.symbol}
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
        <div className="bg-white text-black shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Your Orders</h2>
          {order && (
            <div className="flex justify-between items-center border-b py-2">
              <div>
                <p>
                  <strong>Token Wanted:</strong> {order.tokenOut} {orderTokenInfo.name}
                </p>
                <p>
                  <strong>Amount In:</strong> {formatEther(order.amountIn)} ETH
                </p>
                <p>
                  <strong>Amount Out:</strong> {formatEther(order.amountOutMinimum)}{' '}
                  {orderTokenInfo.symbol}
                </p>
                <p>
                  <strong>Time Limit:</strong> {order.deadline}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => executeOrder(order.encryption as Encryption)}
                  disabled={isLoading}
                  className={`bg-green-500 text-white hover:bg-green-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Executing...' : 'Execute'}
                </button>
                <button
                  onClick={() => handleCancel()}
                  disabled={isLoading}
                  className={`bg-red-500 text-white hover:bg-red-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LimitOrderPage;
