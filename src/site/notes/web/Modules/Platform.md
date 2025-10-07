---
{"dg-publish":true,"dg-path":"Modules/Platform.md","permalink":"/modules/platform/","noteIcon":""}
---


| Dependencies: | [[web/Modules/Localization\|Localization]] |
| ------------- | ---------------- |

Platform module allows you to connect your app the the platform, set up custom parameters that define the app's behavior, stream the user's view to the platform and send back data for analysis or evaluation. 

## Settings

The core of the module is **Platform Manager**. It looks like this: 
![PlatformManagerExample.png](/img/user/img/Examples/PlatformManagerExample.png)
If you don't have the **Parameters** object available, you can create a new one by right-clicking in the **Assets window** → **Create** → **VR Framework** → **Platform Parameters**. Let's take a closer look at them.


When we select the **Parameters** object in the **Assets**, we get to see the settings. These are called the **Internal Parameters** and define the actual app parameters. 
![ParametersExample.png](/img/user/img/Examples/ParametersExample.png)

You can define as many parameters as you like. **Default Value** tells the app what value should the parameter have if it doesn't get the value from the platform. There are also two default parameters - **Language** and **Use Max Game Time**. If true, you can also set **Max Game Time**, which ends the app automatically after specified time.


These **Internal Parameters** however don't get shown on platform automatically. That is why we also have **External Parameters**. 
**External Parameters** are configured in the **VRF Project Settings**, in MyData section. You can find it in **Edit** → **Project Settings** → **VR Framework Settings** → **My Data**.
![MyDataExample.png](/img/user/img/Examples/MyDataExample.png)

**Parameters** specified in this section actually get shown on the platform. When the values of the parameters come from the platform, they get automatically mapped on the **Internal Parameters**. If some of them are missing, they get assigned the default value that we set in the **Internal Parameters** settings. 


There are also fields **Name** and Value. This tells the platform how it should display the app. 
**Name** is the name of the app on the platform. (without spaces!)
**Value** is always stream underscore name.
>Example: I am working on an app called **IAC Flexi 1**. Into the **Name**, I put **IACFlexi1** and since it belongs under **VR Training**, into the field **Value** goes **VRTraining_IACFlexi1**.



---
## Reacting to the parameters

Of course we also need to set up some hooks for the parameters, so that we can actually adjust the app according to the values inside the parameters. This is done with a script called **React On Parameter**. 
![ReactOnParameterExample.png](/img/user/img/Examples/ReactOnParameterExample.png)

There is a dropdown called **Parameter Name** and it contains all of the **Internal Parameters**. **Expected Value** is what should the parameter contain to invoke **On Correct Parameter Value Event**. If the parameter does not have the Expected Value inside, **On Wrong Parameter Value Event** gets invoked.
>Example: I have an **Internal Parameter** called **Param1**, the default value is **"scenario1"** and I set the **React On Parameter** to expect a value **"scenario1**.**"** I set up an **External Parameter** with the same name in **MyData** so that it shows up on the platform. I launch the app from the platform with a parameter value **"scenario2**.**"** When the script loads, it evaluates that the value of **Param1** **does not match** the **expected value**, so the **On Wrong Parameter Value Event** gets invoked. 
>I then turn off the app and launch it without platform. The **Param1** doesn't get any value from platform since we launch it locally without it, so it gets assigned the **default value** **"scenario1**.**"** When the script **React On Parameter** loads, it evaluates that the actual value and expected value **do match**, so it invokes the **On Correct Parameter Value Event**. 



To display the **predefined Internal Parameters** (**Language** and **Max Game Time**) on the platform as **External Parameters**, you have to put the names **lang** and **runTime** into the **MyData** settings. 
![RunTimeLangParams.png](/img/user/img/Examples/RunTimeLangParams.png)

---

## Streaming
There is also a script called **Stream Manager** which ensures the user of the platform can see what the user in VR sees in the app. 
![StreamManagerExample.png](/img/user/img/Examples/StreamManagerExample.png)

If you followed the [[web/Getting Started/Scene Builder\|Scene Builder]], the script is already set up in the scene under the **Game Director** object. It takes the image of **Main Camera** and sends it to the platform. The default settings are just fine, higher quality drains the performance significantly.