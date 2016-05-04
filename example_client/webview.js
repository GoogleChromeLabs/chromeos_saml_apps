var ssoExtId = "ehapbialhheepabljbafehmdmhlgmabf";

function getCookies() {
  chrome.runtime.sendMessage(
    ssoExtId,
    { method: "getAllCookies" },
    function(response) {
      if (!response || !response.cookies) response = { cookies : [] };
      if (onloadhelper) onloadhelper(response.cookies);
    }
  );
}

onload = getCookies();
var onloadhelper = function(cookies) {
  var webview = document.querySelector('webview');

  // convert cookie list to name=value pairs.
  var cookieList = "";
  for (var idx = 0; idx < cookies.length; idx++) {
    cookieList += cookies[idx].name + "=" + cookies[idx].value + (idx == cookies.length-1 ? "" : ";");
  }
  
  // insert cookies, TODO: check for current url/domain before injection
  webview.request.onBeforeSendHeaders.addListener(function (details) {
    // Look for header details here
    console.log("onBeforeSendHeaders called", details.requestHeaders);
    var detail = "requestHeaders";
    var headers = details[detail];
    // Iterate through all headers information
    var foundCookies = false;
    for (var header in headers) {
        // Edit Cookies
        if (headers[header].name == "Cookie") {
            headers[header].value += ";" + cookieList;
            foundCookies = true;
        }
    }

    if (!foundCookies) {
      headers.push({ name: "Cookie", value: cookieList });
    }
    
    // return final headers now
    return {
      requestHeaders: details.requestHeaders
    };

  },
  { urls: ["<all_urls>"] },
  ['blocking', "requestHeaders"]);

  // Navigate to the required URL
  document.querySelector('#Go').onclick = function(e) {
    webview.src = document.querySelector('#location').value;
  };

  // Events to see the URL being redirected
  webview.addEventListener('loadstart', handleLoadStart);
  webview.addEventListener('loadredirect', handleLoadRedirect);
};

// Adjust location URL on load start/redirect
function handleLoadStart(event) {
  if (!event.isTopLevel) {
    return;
  }

  document.querySelector('#location').value = event.url;
}

function handleLoadRedirect(event) {
  if (!event.isTopLevel) {
    return;
  }

  document.querySelector('#location').value = event.newUrl;
}
