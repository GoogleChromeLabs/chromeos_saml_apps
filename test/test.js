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

// 1. Replace chrome.storage.managed.get in background.js with (function(callback) { callback(request.configuration); })
// 2. Reload helper extension
// 3. Update extension ID in testutils.js with extension ID from #2
// 4. Load chrome-extension://<extension ID>/test.html into your browser
// Tests should run until "All Tests Passed!" is printed.
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
      TestUtils.assertCookieValues(response.cookies, ["value1", "value2"]);

      pass("Passed: Domain filter returns proper cookies with single domain filter");
    });
  };

  var testSingleDomainFilterWithPrefixedDotReturnsMultipleCookies= function(pass, fail) {
    var params= TestUtils.aParams({
      "whitelist": [{
          "appId": chrome.runtime.id,
          "domain": ".mytesturl.com"
        }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1")
    .then(function() { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2"); })
    .then(function() { return TestUtils.setCookie("https://some.otherurl.com", "otherurl.com", "Other Name", "othervalue"); })
    .then(function() { return TestUtils.getCookies(params); })
    .then(function(response) {
      TestUtils.assertCookieValues(response.cookies, ["value1", "value2"]);

      pass("Passed: Domain filter returns proper cookies with single domain filter prefixed with dot");
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
      TestUtils.assertCookieValues(response.cookies, ["value1", "value2", "othervalue"]);

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

  var testReturnsUnsecureAndSecureCookies = function (pass, fail) {
    var params = TestUtils.aParams({
      "whitelist": [{
        "appId": chrome.runtime.id,
        "domain": "mytesturl.com"
      }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1", true)
      .then(function () { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2", false); })
      .then(function () { return TestUtils.getCookies(params); })
      .then(function (response) {
        TestUtils.assertCookieValues(response.cookies, ["value1", "value2"]);

        pass("Passed: Secure filter returns both secure and non-secure if filter is omitted");
      });
  };

  var testSecureFilterReturnsSecureCookiesOnly = function (pass, fail) {
    var params = TestUtils.aParams({
      "whitelist": [{
        "appId": chrome.runtime.id,
        "domain": "mytesturl.com",
        "secure": true
      }]
    });

    TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 1", "value1", true)
      .then(function () { return TestUtils.setCookie("https://test.mytesturl.com", "mytesturl.com", "Name 2", "value2", false); })
      .then(function () { return TestUtils.getCookies(params); })
      .then(function (response) {
        TestUtils.assertCookieValues(response.cookies, ["value1"]);

        pass("Passed: Secure filter returns secure cookies only");
      });
  };

  document.getElementById("startBtn").addEventListener("click", function() {
    Promise.resolve("Start Tests")
      .then(TestUtils.testCase(testBadMessageReturnsErrorJson))
      .then(TestUtils.testCase(testNoAppIdReturnsNoCookies))
      .then(TestUtils.testCase(testAppIdNotInWhitelistReturnsNoCookies))
      .then(TestUtils.testCase(testSingleDomainFilterReturnsMultipleCookies))
      .then(TestUtils.testCase(testSingleDomainFilterWithPrefixedDotReturnsMultipleCookies))
      .then(TestUtils.testCase(testMultipleDomainFilterReturnsMultipleCookies))
      .then(TestUtils.testCase(testNoDomainInFilterReturnsNoCookies))
      .then(TestUtils.testCase(testSecondaryFilteringByNameReturnsScopedCookies))
      .then(TestUtils.testCase(testSecondaryFilteringByPathReturnsScopedCookies))
      .then(TestUtils.testCase(testReturnsUnsecureAndSecureCookies))
      .then(TestUtils.testCase(testSecureFilterReturnsSecureCookiesOnly))
      .then(function() { TestUtils.displayResult("All Tests Passed!"); });
  });
})();
