var TestUtils= {};

TestUtils.HELPER_ID= "hplmjanffcfhhpnkpdgngnpkdnhbolll";

TestUtils.getCookies= function(params) {
  return new Promise(function(resolve) {
    chrome.runtime.sendMessage(TestUtils.HELPER_ID, params, resolve);
  });
};

TestUtils.setCookie= function(url, domain, name, value) {
  return new Promise(function(resolve) {
    chrome.cookies.set({ 
      url: url,
      domain: domain,
      value: value,
      name: name,
      secure: true
    }, resolve);
  });
};

TestUtils.clearAllCookies= function() {
    return new Promise(function(resolve) {
      chrome.cookies.getAll({}, function(allCookies) { 
        Promise.all(allCookies.map(function(cookie) {
          var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
          return new Promise(function(resolve, reject) {
            chrome.cookies.remove({ url: url, name: cookie.name }, resolve);
          });
        })).then(resolve);
    });
  });
};

TestUtils.assert= function(condition, msg) {
  if (!condition) throw new Error(msg);
};

TestUtils.testCase= function(testFn) {
  return function() {
    console.log("Started test case"); 
    return new Promise(function(resolve, reject) {
      testFn(function(result) {
        console.log("Finished test case"); 
        resolve(result);
      }, reject);
    })
    .then(TestUtils.displayResult)
    .then(TestUtils.clearAllCookies)
    .then(function() { console.log("Cleared all cookies"); });
  };
};

TestUtils.displayResult= function(result) {
  var resultsNode= document.getElementById("results");
  var e= document.createElement('div');
  e.innerHTML= result;
  resultsNode.appendChild(e);
};

TestUtils.aParams= function(configuration) {
  return {
    method: "getAllCookies", 
    configuration: configuration
  };
};
