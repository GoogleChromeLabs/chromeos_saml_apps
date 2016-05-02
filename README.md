# Chrome OS SAML SSO Helper

Carry over a filtered set of the user's cookies to admin-whitelisted participating apps. An empty whitelist will result in the default behavior which is to block all incoming requests and not hand over any cookies. Please only whitelist apps you fully trust with the user's data. Also please ensure you have all proper consent forms placed for your users as you are granting permissions to certain apps on their behalf and the system will not show the end users any consent forms once permission is granted via admin policy.


## Example admin configuration
After configuring this extension to force-install on Chrome devices, upload the suitable configuration into the admin console so that the proper cookie permissions are granted to the whitelisted apps. The full schema can be found in schema.json. An example configuration:

```javascript
{
  "whitelist": {
    "Value": [
      {
        "appId": "aaaaabbbbbbcccccddddd",
        "domains": ["domain1", "domain2"],
        "urls": ["url1", "url2"]
      },
      {
        "appId": "eeeeefffffgggggghhhhhhh",
        "names": ["name1", "name2"]
      }
    ]
  }
}
```
