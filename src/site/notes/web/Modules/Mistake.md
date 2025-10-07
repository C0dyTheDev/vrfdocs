---
{"dg-publish":true,"dg-path":"Modules/Mistake.md","permalink":"/modules/mistake/","noteIcon":""}
---


| Dependencies: | none |
| ------------- | ---- |

**Mistake Module** is for tracking mistakes that the user makes during the app. It integrates with the [[web/Modules/Minigame\|Minigame]] and [[web/Modules/Platform\|Platform]] Module. 

---
## Configuration

To use the **Mistake Module**, you need the **Mistake Manager** in your scene: 
![MistakeManagerExample.png](/img/user/img/Examples/MistakeManagerExample.png)

There is **Mistake Platform**, which is an object that can be created within the Asset window by **Right-clicking** → **Create** → **VR Framework** → **Mistake Platform**. This object only serves as a holder of the mistakes in between the scenes, no additional configuration inside this object is necessary. Assign it into the **Mistakes Manager**. 


You can preconfigure **Mistakes** with the list in the **Mistakes Manager**:
![MistakesListExample.png](/img/user/img/Examples/MistakesListExample.png)


Each **Mistake** has an internal **Mistake Name** and a **Display Name**, then **Done** checkmark. 

You can then mark the **Mistake** as **Done** (that the user did **not** make the mistake) through an Event method **CheckMistake()**:
![CheckMistakeExample.png](/img/user/img/Examples/CheckMistakeExample.png)
Into the field goes the **Mistake Name**.

You can uncheck the **Mistake** (that he did make the mistake) by calling **UncheckMistake()** the same way.



**Display Name** is what gets displayed on the platform when [[web/Modules/Platform\|Platform Module]] is configured. 
>Example: The user doesn't make the **mistake3**, so we call **CheckMistake(mistake3)** to mark it as **Done**. They complete the app and on the platform in the report it says that they made the mistakes **"Mistake 1"** and **"Very Bad Mistake**.**"**

