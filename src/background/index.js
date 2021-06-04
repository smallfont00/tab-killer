import { getWindowCapacity } from '../utils/chrome-helper';

const DEFAULT_NUMBER = 5;

const setAllWindowsCapacity = value => {
  chrome.windows.getAll(windows => {
    for (const window of windows) {
      const key = `wid:${window.id}`;
      chrome.storage.local.get([key], result => {
        if (result[key] === undefined) {
          chrome.storage.local.set({[key]: value});
        }
      });
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['defaultNumber'], ({ defaultNumber }) => {
    if (defaultNumber === undefined) {
      chrome.storage.local.clear(() => {
        console.log(`[Storage] set defaultNumber #${DEFAULT_NUMBER} at ${Date()}`);
        chrome.storage.local.set({ defaultNumber: DEFAULT_NUMBER });
        setAllWindowsCapacity(DEFAULT_NUMBER);
      });
      return;
    }

    setAllWindowsCapacity(defaultNumber);
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes['defaultNumber']) {
    const { newValue, oldValue } = changes['defaultNumber'];
    if (newValue === undefined) {
      chrome.storage.local.set({ defaultNumber: DEFAULT_NUMBER });
    }
  }
});

chrome.windows.onCreated.addListener(window => {
  chrome.storage.local.get(['defaultNumber'], ({ defaultNumber }) => {
    chrome.storage.local.set({[`wid:${window.id}`]: defaultNumber});
  })
})

chrome.windows.onRemoved.addListener(wid => {
  chrome.storage.local.remove(`wid:${wid}`, () => {
    console.log(`[Storage] remove wid:${wid}`);
  });
})

// TODO: Current Chrome Extension API doesn't provide a native way to restore tab/window information. 
//       But we can use the hash of all url within a windows as an identifier. Then store key/value pair 
//       information in chrome.storage.

// const exchangeSession = (wid, sessId) => {
//   const wKey = `wid:${wid}`;
//   const sKey = `sess:${sessId}`;
// 
//   chrome.storage.local.get([wKey], result => {
//     if (result && result[wKey]) {
//       chrome.storage.local.set({[sKey]: result[wKey]});
//       chrome.storage.local.remove(wKey, () => {
//         console.log(`[Window Listener] key wid:${wid} is removed`);
//       });
//     }
//   })
// }
// 
// chrome.windows.onRemoved.addListener(wid => {
//   chrome.sessions.getRecentlyClosed({ maxResults: 1 }, sessions => {
//     const [session] = sessions;
//     if (session === undefined) return;
//     
//     if (session.tab) {
//       return;
//     }
// 
//     if (session.window && session.window.id === wid) {
//       exchangeSession(wid, session.window.sessionId)
//       return;
//     }
// 
//     chrome.storage.local.remove(`wid:${wid}`, () => {
//       console.log(`[Window Listener] key wid:${wid} is removed`);
//     });
//   })
// });
// 
// chrome.sessions.onChanged.addListener(() => {
//   chrome.sessions.getRecentlyClosed();
// })

chrome.tabs.onCreated.addListener(async tab => {
  const wid = tab.windowId;
  const [tabs, windowCapacity] = 
    await Promise.all([
      chrome.tabs.query({windowId: wid}),
      getWindowCapacity(wid)
    ]);
  
    // TODO: We should switch logic here with resp. to window mode
  if (windowCapacity === undefined) {
    // console.error(`[Tab Listener] ${wid} windowCapacity is not set`);
    return;
  }

  if (tabs.length > windowCapacity) {
    if (tabs[0].id === tab.id) {
      chrome.tabs.remove(tabs[tabs.length - 1].id);
    } else {
      chrome.tabs.remove(tabs[0].id);
    }
  }
});