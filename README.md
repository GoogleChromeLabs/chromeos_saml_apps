# Chrome OS SAML SSO Helper

Admins can force-install this helper extension to carry over a filtered set of the user's cookies to admin-whitelisted participating apps. An empty whitelist will result in the default behavior which is to block all incoming requests and not hand over any cookies. Please only whitelist apps you fully trust with the user's data. Also please ensure you have all proper consent forms placed for your users as you are granting permissions to certain apps on their behalf and the system will not show the end users any consent forms once permission is granted via admin policy.


## Example admin configuration
After configuring this extension to force-install on Chrome devices, upload the suitable configuration into the admin console so that the proper cookie permissions are granted to the whitelisted apps. This can be done by navigating directly to [the App Management URL](https://admin.google.com/AdminHome?fral=1#ChromeAppDetails:appId=ehapbialhheepabljbafehmdmhlgmabf&appType=CHROME&flyout=reg).

The full schema can be found in schema.json. Note that the primary filter is always the domain. Cookie names and paths are all secondary parameters that will be applied *in addition* to the domain filtering. An entry with no domain provided will not return any cookies.

An example configuration:

```javascript
{
  "whitelist": {
    "Value": [
      {
        "appId": "aaaaabbbbbbcccccddddd",
        "domain": "domain1"
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
