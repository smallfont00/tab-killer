import React, { useState, useEffect, useCallback } from 'react';

import "tailwindcss/tailwind.css";

const useLongPress = (callback = () => {}, ms = 300) => {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    if (ms) {
      let timerId;
      if (startLongPress) {
        timerId = setTimeout(() => {
          callback(); 
          setStartLongPress(false);
          console.log(`${ms} ms pass~`);
        }, ms);
      } else {
        clearTimeout(timerId);
      }

      return () => {
        clearTimeout(timerId);
      };      
    }
  }, [callback, ms, startLongPress]);

  return {
    onMouseDown: () => ms && setStartLongPress(true),
    onMouseUp: () => ms && setStartLongPress(false),
    onMouseLeave: () => ms && setStartLongPress(false),
    onTouchStart: () => ms && setStartLongPress(true),
    onTouchEnd: () => ms && setStartLongPress(false),
  };
}

const useChromeStorage = (key, defaultValue) => {
  const [value, setValue] = useState();

  const valueChangedListener = changes => {
    if (changes[key] === undefined) {
      console.log(`[Storage Listener] change detected but changes["${key}"] is not set`);
      return;
    }
    const { newValue, oldValue } = changes[key];
    console.log(`[Storage Listener] change detected: ${key} -> ${newValue}`);
    setValue(newValue);
  };

  useEffect(() => {
    if (key === undefined) return;
    chrome.storage.onChanged.addListener(valueChangedListener);
  }, [key]);

  useEffect(() => {
    if (key === undefined) return;

    chrome.storage.local.get(key, result => {
      if (result[key] === undefined && defaultValue === undefined) {
        console.log(`[Storage] key:${key} does not exist and defaultValue is not set.`);
        return;
      }

      if (result[key] === undefined && defaultValue !== undefined) {
        chrome.storage.local.set({ [key]: defaultValue }, () => {
          console.log(`[Storage] key:${key} does not exist. Assigned value:${defaultValue} for it`);
        });
        return;
      }

      console.log(`[Storage] init: ${key} -> ${result[key]} with defaultValue:${defaultValue} at ${Date()}`);
      setValue(result[key]);
    });
  }, [key, defaultValue]);

  return [
    value,
    newValue => {
      chrome.storage.local.set({ [key]: newValue }, () => console.log(`[Storage] key:${key} local set is finished`));
      console.log(`[Storage] key:${key} local set is called`);
    }
  ]
}

const useWindowCapacity = (defaultNumber) => {
  const [wid, setWid] = useState();
  const [value, setValue] =  useChromeStorage(wid && `wid:${wid}`, defaultNumber);

  useEffect(() => {
    chrome.windows.getCurrent().then(window => {
      setWid(window.id);
    });
  });

  return [
    value,
    setValue
  ];
}

const useBoundedCount = (lowerBound, upperBound, count, setCount) => {
  useEffect(() => {
    if (count < lowerBound) {
      console.log(`${count} is reseted to lower bound: ${lowerBound}`);
      setCount(lowerBound);
    } else if (count > upperBound) {
      console.log(`${count} is reseted to upper bound: ${upperBound}`);
      setCount(upperBound);
    }
  }, [count, lowerBound, upperBound])

  return [
    count,
    setCount
  ]
}

const Zen = () => {
  const [defaultNumber, setDefaultNumber] = useChromeStorage("defaultNumber");
  const [windowCapacity, setWindowCapacity] = useWindowCapacity(defaultNumber);
  const [count, setCount] = useBoundedCount(5, 20, windowCapacity, setWindowCapacity);

  const decrease = useLongPress(() => setCount(count - 1), 500);
  const increase = useLongPress(() => setCount(count + 1), 200 * count);
  
  return (
    <div className="w-40 h-20 mx-auto whitespace-nowrap relative">
      <div className="absolute w-40 z-0 text-center h-full text-7xl select-none">{count || "?"}</div>
      <div className="w-full h-full shadow-lg rounded-lg">
        <button 
          className="relative w-1/2 h-full inline-block z-10 focus:outline-none active:shadow-xl rounded-r-none rounded-lg" 
          {...decrease} />
        <button 
          className="relative w-1/2 h-full inline-block z-10 focus:outline-none active:shadow-xl rounded-l-none rounded-lg" 
          {...increase} />        
      </div>
    </div>
  )
};

const Popup = () => {
  // TODO: switch popup if mode not setted
  // TODO: Window's mode should be setted here.
  return <Zen />
};

export default Popup;