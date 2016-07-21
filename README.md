# SAML SSO for Chrome Apps

SAML SSO for Chrome devices carries only into applications accessed by Chrome browser and not into Chrome Apps. Chrome Apps that need access to these SAML cookies can request them from the *SAML SSO for Chrome Apps* extension. These apps are granted permission by admins who have to force-install and configure this extension to carry over a filtered set of the user's cookies to the whitelisted participating apps. Documentation for the admin setup can be found on the [Chrome for Work support pages](https://support.google.com/chrome/a/topic/6274255).

## Communicating with the extension
The *SAML SSO for Chrome Apps* extension provides an interface over Chrome's [cross-extension messaging system](https://developer.chrome.com/extensions/runtime#method-sendMessage). To get all cookies whitelisted for the participating app by the admin, call *chrome.runtime.sendMessage* with the proper parameters.

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
More details can be found on the [Chrome for Work support page](https://support.google.com/chrome/a/answer/7064180).

## Android Runtime for Chrome
Apps developed with [Android Runtime for Chrome](https://developer.chrome.com/apps/getstarted_arc) can also get access to those cookies. They can communicate with the Chrome SSO extension via a special Android intent.

```java

class ChromeMessageReceiver extends BroadcastReceiver {
    private static String TAG = "ChromeMessageReceiver";

    public List<Intent> receivedMessages = new ArrayList<Intent>();

    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "ARC app received Chrome message: " + intent);
        receivedMessages.add(intent);
        synchronized (this) {
            this.notifyAll();
        }
    }
}

public class ChromeMessagingTestActivity extends Activity {
    private static String TAG = "ChromeMessagingTestActivity";

    private ChromeMessageReceiver mReceiver = new ChromeMessageReceiver();

    @Override
    public void onStart() {
        super.onStart();
        registerReceiver(mReceiver,
                new IntentFilter("org.chromium.arc.CHROME_MESSAGE_RECEIVED"));
    }


    @Override
    public void onStop() {
        super.onStop();
        unregisterReceiver(mReceiver);
    }

    public void sendMessage(String extensionId, String data) {
        Intent i = new Intent("org.chromium.arc.SEND_CHROME_MESSAGE");
        i.setPackage("android");
        i.putExtra("org.chromium.arc.ExtensionId", extensionId);
        i.putExtra("org.chromium.arc.Request", data);
        Log.d(TAG, "ARC app sending Chrome message: " + data);
        sendBroadcast(i);
    }

    public List<Intent> getReceivedMessages() {
        return mReceiver.receivedMessages;
    }

    public boolean waitForMessages(int numberOfMessagesInQueue, int timeout) {
        if (mReceiver.receivedMessages.size() < numberOfMessagesInQueue) {
            try {
                synchronized (mReceiver) {
                    mReceiver.wait(timeout);
                }
            } catch (InterruptedException e) {
            }
        }
        return mReceiver.receivedMessages.size() >= numberOfMessagesInQueue;
    }
}
```
