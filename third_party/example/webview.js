/**
* Copyright 2016 Citrix Systems, Inc. All Rights Reserved.
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

var startNow = function() {
  var webview = document.querySelector('webview');
  webview.style.height = "auto";
  webview.style.width = "100%";
  
  // Change URL here to load cookies for different URL.
  webview.src = "https://github.com";
};

// Identify domains that we have cookies for.
// Send a request for each domain.
// Set the cookies for the domain using Set-Cookie header using onHeadersReceived event.
function setCookies(cookies) {
	// send a request for a given url and set cookies
	function sendRequest(url, cookies, requestDone) {
		// Load webview element with request URL. Use same partition as Receiver to share cookies
		var	tempView = document.createElement("webview");
		
		// We need to always callback after success or error so loadstop event is enough
		tempView.addEventListener("loadstop", function(e) {
			// we are done with webview
			console.log("Done with setting cookies for: " + url);
			document.body.removeChild(tempView);
			requestDone();
		});
			
		// Set the cookies in response headers
		tempView.request.onHeadersReceived.addListener(function (e) {
			var headers = e.responseHeaders;
			if (e.type === "main_frame") {
				if (cookies.length > 0) {
					cookies.forEach(function(cookie) {					
						// Set each cookie as Set-Cookie response header
						var result = cookie.name + "=" + cookie.value; // set name-value
						if (cookie.expirationDate) { // set expiry, need to use UTC timestmap
							var date = new Date(cookie.expirationDate * 1000);
							result += "; expires=" + date.toUTCString();
						}
						if (cookie.domain) { // set domain
							result += "; domain=" + cookie.domain;
						}
						if (cookie.path) { // set path
							result += "; path=" + cookie.path;
						}
						if (cookie.secure === true) { // set secure
							result += "; secure";
						}
						if (cookie.httpOnly === true) { // set secure
							result += "; httpOnly";
						}
						headers.push({"name" : "Set-Cookie", "value" : result});
					});
				}
			}
			
			// return final headers now
			return {
				"responseHeaders": headers
			};
		}, { urls: [url + "/*"] }, ['blocking', "responseHeaders"]); // We care only about the urls we sent request for.
		
		// No need to show it. Can reuse this if you have lot of domains
		tempView.style.display = "none";
		tempView.src = url;
		document.body.appendChild(tempView); // this will be removed once we are done with request
	}

	// Identify list of domains.
	var cookieMapping = {}, count = 0;
	for (var idx = 0; idx < cookies.length; idx++) {
		var cookie = cookies[idx];
		if (!cookie) continue;
		
		var cookie_dom = cookie.domain;
		if (cookie_dom[0] === ".") { // trim the leading dot in case a cookie has it.
			cookie_dom = cookie_dom.substr(1);
		}
		
		// URL = http + secure + :// + domain
		var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie_dom;
		if (!cookieMapping[url]) {
			cookieMapping[url] = [];
			count++;
		}
		cookieMapping[url].push(cookie); // add cookie to pending url request
	}
	
	// Nothing to do, no cookies present.
	if (count === 0) {
		startNow();
		return;
	}
	
	// send request for each domain
	// Let's clear out the cookie store. You can be intelligent and clear out only if we find new cookies compared to previous.
	document.querySelector('webview').clearData({since:0}, {cookies:true}, function() {
		console.log("Start sending requests: ", cookieMapping);
		for (var item in cookieMapping) {
			sendRequest(item, cookieMapping[item], function() {
				if (--count === 0) {
					// done with all requests
					startNow();
				}
			});
		}
	});
}

// Send a message to SSO extension and set them to webview cookie store
function getCookies() {
  var ssoExtId = "aoggjnmghgmcllfenalipjhmooomfdce"; // https://chrome.google.com/webstore/detail/aoggjnmghgmcllfenalipjhmooomfdce/
  chrome.runtime.sendMessage(
    ssoExtId,
    { method: "getAllCookies" },
    function(response) { 
      console.log("response received from SSO extension: ", response);
      if (!response || !response.cookies) {
		// we are done
		startNow();
		return;
	  }
	  // persist cookies and start
      setCookies(response.cookies);
    }
  );
}

window.addEventListener("DOMContentLoaded", getCookies);