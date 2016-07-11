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
 *
 *
 * Calls for admin provided whitelist and uses that to extract all
 * user cookies that are allowed for app with appId.
 * 
 * Filters are applied jointly with domain being the primary filter 
 * and all other parameters forming secondary filters in addtiion.
 * 
 * @params {object} params An object containing 
 *      1. the appId of the caller
 *      2. the whitelist configuration fetched from policy
 *      3. the callback to return retrieved cookies
 */
var getAllCookies= function(params) {
  var combinedPromises= [];
  var allowed= params.configuration.whitelist.filter(function(entry) { return entry.appId === params.appId; });

  if (!allowed || allowed.length === 0) return params.callback({ cookies: [] });
  
  allowed.forEach(function(allowedEntry) {
    if (!allowedEntry.domain) return; // Domain required as primary filter

    var details= { domain: allowedEntry.domain };
    if (allowedEntry.name) details.name= allowedEntry.name;
    if (allowedEntry.path) details.path= allowedEntry.path;
    if (allowedEntry.secure !== undefined) details.secure= allowedEntry.secure;

    details.storeId = "0";  // Needed otherwise result is empty list if call is made before a browser tab is opened. Probably some strange Chrome-ChromeOS interaction bug.
    combinedPromises.push(new Promise(function(resolve, reject) {
      chrome.cookies.getAll(details, resolve);
    }));
  });

  Promise.all(combinedPromises).then(function(combinedResponses) {
    combinedResponses= combinedResponses
                        .reduce(function(prev, cur) { return prev.concat(cur); }, [])  // flatten multuple responses into single array
                        .filter(function(cookieResponse) { return cookieResponse.domain.indexOf("google.") === -1; });  // filter Google top level deomains. This will also filter SAML IdPs that fall undewr this pattern but it is worth the resulting code simplification

    params.callback({ cookies: combinedResponses });
  });
};

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    request= request || {};
    if (request.method === "getAllCookies") {
      chrome.storage.managed.get(function(configuration) {
        if (!configuration.whitelist) configuration.whitelist= [];
        getAllCookies({
          appId: sender.id,
          configuration: configuration,
          callback: sendResponse
        });
      });

      return true;  // Informs message handler that response is async
    } else {
       sendResponse({ sorry : "no_go" });
    }
  }
);