'use client'

import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

const LimitOrderPage = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderLimit, setOrderLimit] = useState('');
  const [orders, setOrders] = useState<{id: number, tokenAddress:string, orderPrice: string, orderLimit: string}[]>([]);

  const userAddress = '0x1234...5678'; // Replace with actual user address
  const ethBalance = '1.5 ETH'; // Replace with actual ETH balance

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newOrder = { id: Date.now(), tokenAddress, orderPrice, orderLimit };
    setOrders([...orders, newOrder]);
    setTokenAddress('');
    setOrderPrice('');
    setOrderLimit('');
  };

  const handleCancel = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tokenAddress">
              Token Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="tokenAddress"
              type="text"
              placeholder="Enter token address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderPrice">
              Order Price
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="orderPrice"
              type="number"
              placeholder="Enter order price"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderLimit">
              Order Limit
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="orderLimit"
              type="number"
              placeholder="Enter order limit"
              value={orderLimit}
              onChange={(e) => setOrderLimit(e.target.value)}
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
          {orders.map((order) => (
            <div key={order.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p><strong>Token:</strong> {order.tokenAddress}</p>
                <p><strong>Price:</strong> {order.orderPrice}</p>
                <p><strong>Limit:</strong> {order.orderLimit}</p>
              </div>
              <button
                onClick={() => handleCancel(order.id)}
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