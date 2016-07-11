/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var TestUtils= {};

TestUtils.HELPER_ID= "efloepbegjfnahghcfpnbkdljabmgnni";

TestUtils.getCookies= function(params) {
  return new Promise(function(resolve) {
    chrome.runtime.sendMessage(TestUtils.HELPER_ID, params, resolve);
  });
};

TestUtils.setCookie= function(url, domain, name, value, secure) {
  return new Promise(function(resolve) {
    chrome.cookies.set({ 
      url: url,
      domain: domain,
      value: value,
      name: name,
      secure: secure === undefined ? true : secure
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
