import { LimitOrder } from "./types/limit-order";

export const useLocalStorage = () => {
  
  const getValue = (key: STORAGE_KEY ): string| null => {
    try {
      const item = window.localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const setValue = (key: STORAGE_KEY, value: string) => {
    try {
      window.localStorage
        .setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  }

  const getLimitOrders = (): LimitOrder[] => {
    const limitOrders = getValue(STORAGE_KEY.LIMIT_ORDERS);
    if (limitOrders) {
      return JSON.parse(limitOrders) as LimitOrder[];
    }
    return [];
  }

  const setLimitOrders = (orders: LimitOrder[]) => {
    setValue(STORAGE_KEY.LIMIT_ORDERS, JSON.stringify(orders));
  }

  const addLimitOrder = (order: LimitOrder) => {
    const orders = getLimitOrders();
    orders.push(order);
    setLimitOrders(orders);
  }

  return { getValue, setValue, setLimitOrders, getLimitOrders, addLimitOrder };
}

export enum STORAGE_KEY {
  LIMIT_ORDERS = 'limit_orders',
}