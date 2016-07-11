# SAML SSO for Chrome Apps

SAML SSO for Chrome devices carries only into applications accessed by Chrome browser and not into Chrome Apps. Chrome Apps that need access to these SAML cookies can request them from the *SAML SSO for Chrome Apps* extension. Admins would then have to force-install and configure this extension to carry over a filtered set of the user's cookies to whitelisted participating apps. Documentation for the admin setup can be found on the [Chrome for Work support pages](https://support.google.com/chrome/a/topic/6274255).

## Communicating with the extension
The *SAML SSO for Chrome Apps* extension provides an interface over Chrome's [cross-extension messaging system](https://developer.chrome.com/extensions/runtime#method-sendMessage). To get all cookies whitelisted for the participating app by the admin, invoke *chrome.runtime.sendMessage* with the proper parameters.

```javascript
chrome.runtime.sendMessage(
              "aoggjnmghgmcllfenalipjhmooomfdce",
              { method: "getAllCookies" },
              function(response) {
                // do something with *response.cookies*
              }
          );
```

## Using acquired cookies
Once the Chrome App has the relevant authentication cookies, it can attach them to outgoing requests on its hosted webview using the various methods available from webview's [Web Request interface](https://developer.chrome.com/apps/tags/webview#type-WebRequestEventInterface).

## Whitelisting apps and domains
The *SAML SSO for Chrome Apps* has to be both force-installed and configured for user accounts. This can be done by navigating directly to [the App Management URL](https://admin.google.com/AdminHome?fral=1#ChromeAppDetails:appId=aoggjnmghgmcllfenalipjhmooomfdce&appType=CHROME&flyout=reg) corresponding to this extension.

The full schema of possible configurations can be found in [schema.json](https://github.com/GoogleChrome/chromeos_saml_apps/blob/master/src/schema.json). Note that the primary filter is always the domain. Cookie names, paths, and secure properties are all secondary parameters that will be applied *in addition* to the domain filtering. An entry with no domain provided will not return any cookies. An example configuration:

```javascript
{
  "whitelist": {
    "Value": [
      {
        "appId": "aaaaabbbbbbcccccddddd",
        "domain": "domain1",
        "secure": true
      },
      {
        "appId": "aaaaabbbbbbcccccddddd",
        "domain": "domain1",
        "name": "Secondary Cookie Name"
      },
      {
        "appId": "eeeeefffffgggggghhhhhhh",
        "domain": "domain1",
        "path": "secondary.path"
      }
    ]
  }
}
```

More details can be found on the [Chrome for Work support pages](https://support.google.com/chrome/a/topic/6274255).
