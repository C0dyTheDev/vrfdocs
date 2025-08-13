---
{"dg-publish":true,"dg-path":"Modules/Localization.md","permalink":"/modules/localization/","noteIcon":""}
---


| Dependencies: | none |
| ------------- | ---- |

Localization module is designed to provide translation features for your project. It enables you to create translated audio, text and sprites for any language that you might need. It can integrate with Platform module - language is set automatically based on a parameter. 

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
![LanguageManagerExample.png](/img/user/img/LanguageManagerExample.png)

If you do not see any Selected Language, add one in your Language Config and click through some of the lists a few times - Unity sometimes doesn't register new objects in the editor that well so we need to trigger it manually. 
If you still see errors, it is still because of the problem stated above, try to restart Unity and hopefully that will fix the problem. This thankfully needs to be done only once. 
Still seeing errors? Report an issue in [[web/2Issue Tracker\|Issue Tracker]] or when urgent, contact VRF Team directly.


## Adding Translations
To add localized content, you need to open the lists we set up above. Each list consists of **Untranslated Entries** and **Translated Entries**. 
For example, **Audio List** can look like this:
![AudioListExample.jpeg](/img/user/img/AudioListExample.jpeg)
If you get the error that Language Manager object is not available, you probably didn't set up the module correctly, revisit the steps above. 

Each of the entries is labeled with an **ID** and respective translations. Language manager identifies the element with the ID and returns the corresponding translated element. In other words - you no longer assign the specific files, you assign the ID and let the module choose the correct file for you. 