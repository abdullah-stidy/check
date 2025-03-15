"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Get from local storage by key
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key)
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue
      } catch (error) {
        console.log(error)
        return initialValue
      }
    }
    return initialValue
  })

  // useEffect to update localStorage when the state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      } catch (error) {
        console.log(error)
      }
    }
  }, [key, storedValue])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      // localStorage is now handled by the useEffect
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}