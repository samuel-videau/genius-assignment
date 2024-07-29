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

  return { getValue, setValue };
}

export enum STORAGE_KEY {
  PKP_PUB = 'pkp_pub',
}