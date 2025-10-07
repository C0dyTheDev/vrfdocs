---
{"dg-publish":true,"dg-path":"Modules/Voice React.md","permalink":"/modules/voice-react/","noteIcon":""}
---

**Voice React Module** allows you to react on user's voice. It can enhance the app experience and make it much more immersive. At the moment, the model can distinguish between **"Ano"** and **"Ne"** but you can also react to the user's voice itself without the need to recognize the specific words. 

## Setting it up

To use the module, you will need two scripts - **Voice Module Handler** and **React On Voice**. 
**Voice Module Handler** just has to be in the scene. It registers the **microphone input** and evaluates what did the user say. It looks like this: 
![VoiceModuleHandlerExample.png](/img/user/img/Examples/VoiceModuleHandlerExample.png)
**Threshold Offset** determines how loud the user has to be for the microphone to activate and pick up the sound. 
**Keep Alive Delay** is a time that keeps the microphone on after it went down below the threshold. If microphone goes above the threshold again while this delay is active, it continues the recording. This ensures accidental pauses in the word don't cut the recording too early. 
**Clip Len Seconds** is the maximum length of one recording. 
**Clip Frequency** is the "quality" of the microphone recording. In 99% cases, this doesn't need to be edited at all. 44100Hz is the absolute standard in regular audio recording.


## React On Voice

So now we can go and set up the events. Add **React On Voice** on any desired object. It looks like this: 
![ReactOnVoiceExample.png](/img/user/img/Examples/ReactOnVoiceExample.png)

Into **Voice Module Handler** goes the global script we set up earlier. 
There are multiple events:
- **On Yes Event**
- **On No Event**
- **On Mic Start Event**
- **On Mic Stop Event**

Each recording begins when microphone volume goes above the **Threshold** that we set in **Voice Module Handler** and ends when the volume is below the **Threshold** for at least **Keep Alive Delay** time. When that happens - the microphone starts recording, it invokes the **On Mic Start Event**. 
When the microphone stops recording, it invokes the **On Mic Stop Event**. 
The recording is then passed to the **model** trained on people saying **"Ano"** and **"Ne"** which evaluates whether the user said **"Ano"** - which invokes the **On Yes Event** - or **"Ne"** - which invokes the **On No Event**. 
>Note: **Every single one** recording is evaluated, even when the user says something **completely different**, it evaluates it to be **"Ano"** or **"Ne**.**"**



If we left the script like that, it would be constantly evaluating what the user said. If we don't want to do that - when we want to **not react** on voice - we just **disable the script** in the scene. When disabled, it won't react on anything and will not even trigger the recording. 
>Important note: When **multiple React On Voice** scripts are active at the same time, they **all evaluate** what the user said and they **all invoke** the events!