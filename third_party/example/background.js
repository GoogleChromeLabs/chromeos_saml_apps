chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('webview.html', {
  	id: "webview",
    innerBounds: {
      'width': 1024,
      'height': 768
    }
  });
});