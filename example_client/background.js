chrome.app.runtime.onLaunched.addListener(function() {
  chrome.runtime.sendMessage(
    "ehapbialhheepabljbafehmdmhlgmabf",
    { method: "getAllCookies" },
    function(response) { console.log(response); }
  );

  chrome.runtime.sendMessage(
    "ehapbialhheepabljbafehmdmhlgmabf",
    "bad message!",
    function(response) { console.log(response); }
  );
  
  chrome.runtime.sendMessage(
    "gknaegibklhojbihiflaaihhfieiajbc",
    { method: "getAllCookies" },
    function(response) { console.log(response); }
  );

  chrome.runtime.sendMessage(
    "gknaegibklhojbihiflaaihhfieiajbc",
    "bad message!",
    function(response) { console.log(response); }
  );
});