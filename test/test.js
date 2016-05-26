// 1. Replace chrome.storage.managed.get with (function(callback) { callback(request.configuration); })
// 2. Reload helper extension
// 3. Load chrome-extension://<extension ID>/test.html into your browser
(function() {

  var testBadMessageReturnsErrorJson= function(pass, fail) {
    TestUtils.getCookies("bad message!")
    .then(function(response) {
      TestUtils.assert(response.sorry === "no_go");
      pass("Passed: Bad message returns error json");
    });
  };

  var testNoAppIdReturnsNoCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "domain": "google.com",
          "name": "GMAIL_AT"
        }]
    });

    TestUtils.getCookies(params)
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 0);
      pass("Passed: No appId returns no cookies");
    });
  };

  var testAppIdNotInWhitelistReturnsNoCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": "RandomAppId",
          "domain": "google.com",
          "name": "GMAIL_AT"
        }]
    });

    TestUtils.getCookies(params)
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 0);
      pass("Passed: App Id not whitelisted returns no cookies");
    });
  };

  var testSingleDomainFilterReturnsMultipleCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": "mytesturl.com"
        }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.setCookie("https://some.otherurl.com", "otherurl.com", "Other Name", "othervalue"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 2);
      TestUtils.assert(response.cookies[0].value === "value1");
      TestUtils.assert(response.cookies[1].value === "value2");

      pass("Passed: Domain filter returns proper cookies with single domain filter");
    });
  };

  var testMultipleDomainFilterReturnsMultipleCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": "mytesturl.com"
        },
        {
          "appId": chrome.runtime.id,
          "domain": "otherurl.com"
        }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.setCookie("https://some.otherurl.com", "otherurl.com", "Other Name", "othervalue"); })
    .then(function() { return TestUtils.setCookie("https://wrongotherurl.com", "wrongotherurl.com", "Wrong Name", "wrong"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 3);
      TestUtils.assert(response.cookies[0].value === "value1");
      TestUtils.assert(response.cookies[1].value === "value2");
      TestUtils.assert(response.cookies[2].value === "othervalue");

      pass("Passed: Domain filter returns proper cookies with multiple domain filters");
    });
  };
  
  var testNoDomainInFilterReturnsNoCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "name": "Name 1"
        }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 0);

      pass("Passed: Domain filter returns no cookies if no domain filter is provided");
    });
  };

  var testSecondaryFilteringByNameReturnsScopedCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": "mytesturl.com",
          "name": "Name 2"
        }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 1);
      TestUtils.assert(response.cookies[0].name === "Name 2");

      pass("Passed: Domain filter can be scoped by secondary name parameter");
    });
  };
  
  var testSecondaryFilteringByPathReturnsScopedCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": "mytesturl.com",
          "path": "/this/one/here"
        }]
    });

    TestUtils.setCookie("https://mytesturl.com/this/one/here/XYZ", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://mytesturl.com/that/one/there/ABC", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 1);
      TestUtils.assert(response.cookies[0].path === "/this/one/here");

      pass("Passed: Domain filter can be scoped by secondary path parameter");
    });
  };

  var testGoogleDomainCookiesAreFilteredOut= function(pass, fail) {
        var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": "google.com"
        }]
    });

    TestUtils.setCookie("https://mail.google.com", "google.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://docs.google.com", "google.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.setCookie("https://google.com", "google.com", "Name 3", "value3"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assert(response.cookies.length === 0);

      pass("Passed: API filters out Google-based domains");
    });
  };

  Promise.resolve("Start Tests")
  .then(TestUtils.testCase(testBadMessageReturnsErrorJson))
  .then(TestUtils.testCase(testNoAppIdReturnsNoCookies))
  .then(TestUtils.testCase(testAppIdNotInWhitelistReturnsNoCookies))
  .then(TestUtils.testCase(testSingleDomainFilterReturnsMultipleCookies))
  .then(TestUtils.testCase(testMultipleDomainFilterReturnsMultipleCookies))
  .then(TestUtils.testCase(testNoDomainInFilterReturnsNoCookies))
  .then(TestUtils.testCase(testSecondaryFilteringByNameReturnsScopedCookies))
  .then(TestUtils.testCase(testSecondaryFilteringByPathReturnsScopedCookies))
  .then(TestUtils.testCase(testGoogleDomainCookiesAreFilteredOut))
  .then(function() { TestUtils.displayResult("All Tests Passed!"); });
})();