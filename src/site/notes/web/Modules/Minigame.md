---
{"dg-publish":true,"dg-path":"Modules/Minigame.md","permalink":"/modules/minigame/","noteIcon":""}
---


| Dependencies: | [[web/Modules/Mistake\|Mistake]] |
| ------------- | ----------- |

This module was created specifically for **Training**, it allows you to link multiple scenes and run them at a specific order with custom loading logic and time limits. 

---
## Minigame Manager
For the module to work correctly, you need a **Minigame Manager** in the scene. It looks like this: 
![MinigameManagerExample.png](/img/user/img/MinigameManagerExample.png)
**Minigames** is the settings for the module, we will discuss how to set the module up down below this section. Sometimes we don't want to have a time limit, so if **Should Count Time** is false, it won't use the **Real Time** and **Shown Time** from the **Minigames Settings**. **On Fail Event** is just an event that is invoked f.e. when time limit hits 0 or **MinigameManager.FailedPart()** is called.

---
## Settings
You can create new **Minigames Settings** by **Right-clicking** in the **Assets** window and selecting **Create** → **VR Framework** → **Minigames Settings**. 
![MinigamesSettingsExample.png](/img/user/img/MinigamesSettingsExample.png)

Each **Part** represents one possibly loaded scene. **Real Time** and **Shown Time** are for the time limit settings. **Shown Time** is what time does the user see that they have left, **Real Time** is what time is actually left. This is for the purpose of creating an illusion that they have the same amount of time, but we speed the time up a little bit so the user can become more effective. 


**Scene To Load Names** is a list of names of the scenes that belong into this specific part. It picks a random scene from the list and loads it when the part is active.
>Note: The scenes have to be in the **Build Index**. 



**On Failed Return To Level** says which **Part** should be loaded if the user fails to complete the **Part** in said time limit (**Real Time**). With this, we can create complex logic for loading specific scenes based on how the user is performing. 