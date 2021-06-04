const getWindowCapacity = (wid) => {
  const widKey = `wid:${wid}`;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([widKey], (result) => {
      resolve(result[widKey]);
    })
  })
}

module.exports = {
  getWindowCapacity
}