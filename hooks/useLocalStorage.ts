import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const getInitialValue = () => {
        if (typeof localStorage === "undefined") {
            return initialValue;
        }

        return JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue)) as T;
    }    
    
    const [storedValue, setStoredValue] = useState<T>(getInitialValue());



    const setValue = (value: T) => {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(key, JSON.stringify(value));

            setStoredValue(value);
        }
    };
    return [storedValue, setValue] as [T, typeof setValue];
}