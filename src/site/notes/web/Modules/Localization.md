---
{"dg-publish":true,"dg-path":"Modules/Localization.md","permalink":"/modules/localization/","noteIcon":""}
---


| Dependencies: | none |
| ------------- | ---- |

Localization module is designed to provide translation features for your project. It enables you to set up translated audio, text and sprites for any language that you might need. It can integrate with Platform module - language is set automatically based on a parameter. 

# Usage

## Setup
For Language module to work correctly, you will need: 
- Audio List
- Sprite List
- Text List
- Language Config
- Language Manager in scene

All of the lists above should already be included in your project, however you can create new ones with **Right Click** in the **Assets window** and in the context menu: **Create** → **VR Framework** → **Language**

Then set all of these in the Language Manager in your scene, it should look something like this: 
![LanguageManagerExample.png](/img/user/img/Examples/LanguageManagerExample.png)

If you do not see any **Selected Language**, add one in your **Language Config** and click through some of the lists a few times - Unity sometimes doesn't register new objects in the editor that well so we need to trigger it manually. 
If you still see errors, it is still because of the problem stated above, try to restart Unity and hopefully that will fix the problem. This thankfully needs to be done only once. 
Still seeing errors? Report an issue in [[web/2Issue Tracker\|Issue Tracker]] or when urgent, contact VRF Team directly.


## Adding Translations
To add localized content, you need to open the lists we set up above. Each list consists of **Untranslated Entries** and **Translated Entries**. 
For example, **Audio List** can look like this:
![AudioListExample.jpeg](/img/user/img/Examples/AudioListExample.jpeg)
If you get the error that **Language Manager** object is not available, you probably didn't set up the module correctly, revisit the steps above. 


Each of the entries is labeled with an **ID** and respective translations. **Language Manager** identifies the element with the **ID** and returns the corresponding translated element. In other words - you no longer assign the specific files, you assign the **ID** and let the module choose the correct file for you. 


**Untranslated entries** have only one file under each **ID**, you should use them for sound effects and for sounds that don't need translations. 
Translated entries have a file for each language you have in the **Language Config**.


## Audio
To use translated audio and play it, you need a script called **PlayAudio.cs**. In editor, it looks like this: 
![PlayAudioScript.png](/img/user/img/Examples/PlayAudioScript.png)
When you click on the big button, it shows you a window with all the **IDs**that you have created in your **Audio List**. You can filter the **IDs** and see what file belongs to which **ID**. 
![PickAudio.png](/img/user/img/Examples/PickAudio.png)
You have the option to sort the entries by **IDs** and hide/show **Untranslated** and **Translated** entries. By double clicking the **ID** or selecting it and clicking OK selects the entry.


**Use Custom Audio Source** means whether to play the audio from the global audio source selected in **Game Director** or if you want to use your own. 
**After Audio** event invokes right after the audio finishes playing.


## Graphics
You can use the **Sprite List** to create translations for images, f.e. images with text that needs to be localized. The list works the same as for the **Audio**. There are two scripts available for using the translated sprite - **LocalizedSprite.cs** and **LocalizedTexture.cs**.

![GraphicsLocalizationModule.png](/img/user/img/Examples/GraphicsLocalizationModule.png)
**LocalizedSprite.cs** changes the sprite of a **Sprite Renderer**.
**LocalizedTexture.cs** changes the texture on the assigned **Material** of the object. This of course means, that the material on the object has to be modifiable - so it cannot be the **Default** material. **Material Index** tells the script which of the materials in the **Materials** list of the **Renderer** should the script modify and **Set Emission Map** - if true - changes the **Emission** texture of the material in addition to the **Base** texture.


## Text
The last of the lists is the Text List. Again, the settings are the same as for the Audio and Sprite lists, so refer to the text above for setting it up. 

To change the text of **Text Mesh Pro Text** component, we need a script called **LocalizedText.cs**.
![LocalizedTextExample.png](/img/user/img/Examples/LocalizedTextExample.png)
