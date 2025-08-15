---
{"dg-publish":true,"dg-path":"Modules/Interaction.md","permalink":"/modules/interaction/","noteIcon":""}
---


| Dependencies: | none |
| ------------- | ---- |

Interaction module ensures a gateway between the user and the app. It allows you to create interactive and seamless experiences while being easy to set up and use. 


The automatic [[web/Getting Started/Scene Setup\|Scene Setup]] ensures correct settings for the **Interaction** module, so you don't need to do anything yourself. 


Important note about the new **Interaction 3.0** is that now it has two sets of hands - one that correspond to the headset **tracking** and one that serve as the actual **visual** of the hands for the user.


## Scripts
### GrabbableObject.cs

What serves as the foundation of an interactable object is this one script. Attaching this script to your object will trigger an automatic setup for correct behavior of the grabbing. After that, you should see something like this: 
![GrabbableObjectExample.png](/img/user/img/GrabbableObjectExample.png)

There are three **Grab Types**:
- **Distance Pinch**
- **Distance Grab**
- **Physical Grab**

**Distance Pinch** works with **Thumb** and one additional **Grab Finger** - it measures the distance between these two and if it is lower than **Pinch Distance**, it grabs the object. 


**Distance Grab** works similarly but instead of one finger, it tracks the entire and measures how much is the user clenching the palm. If they clench it beyond the **Grab Distance**, it grabs the object.
![DistanceGrab.png](/img/user/img/DistanceGrab.png)

And lastly **Physical Grab**. This one is the most complex, as it allows you to choose which **fingers** are needed to grab the object. This type of grab checks whether the required fingers are **touching** the object and if so, grabs the object and **locks the fingers** in place until the object is **released**. 
![PhysicalGrab.png](/img/user/img/PhysicalGrab.png)


There are also some settings that also affects how the grab behaves. First one is **Permanent Grab**, which locks the object in user's hand until it is force dropped by code or snapped into **Snap Drop Zone**. **Can Swap Hands** is whether the user can pass the object from one hand to another. 


The interesting parameter is **Use Custom Grab Poses**. With **Interaction 3.0**, you can define fully custom hand pose for each hand. When turned on, two new buttons appear: 
![CustomGrabPoseButtons.png](/img/user/img/CustomGrabPoseButtons.png)
One for each hand. When clicked, you can edit the pose with a hand ghost in the scene.
![GrabPoseExample.png](/img/user/img/GrabPoseExample.png)

When satisfied with the pose, you can click the **Stop Editing** button and it will save the pose. 
>Info: Do not actually move the **Grabbable Object** itself. Align the hand and pose around it. Moving the object doesn't do anything other than actually moving the object in scene. 



There are also some **Events** available, these are self explanatory. 
**Grabbable Object** also attaches a [[web/Additions/Highlight\|Highlight]] component. 


If you want to block the user from grabbing the object, always turn off the **Grabbable Object** script, **NEVER** turn off the collider.

---
### SnapDropZone.cs

Sometimes, you want to set up a specific place for the user to place an object. For that there is a script called **Snap Drop Zone**. This script allows you to create a ghost for a specific object for the user to drop the object in. 


The script looks like this:
![SnapDropZoneExample.png](/img/user/img/SnapDropZoneExample.png)

There are two **Snap Types**:
- **Normal**
- **Repick**

**Normal** causes the object to snap and until programmatically said, cannot be picked up from the zone again. 

**Repick** is the opposite - the user can pick up the object from the zone again, snap it back in, grab it again and so on... 


**Identification Type** means how is it going to know which object can it snap and which not. When f.e. the type is set to name and we'll put "Cube" inside, it will snap any object that has the name "Cube" and if not, it will just ignore the object. 

There are three **Identification Types**: 
- **Name**
- **Tag**
- **Object**

**Name** checks the name of the object, if they match, the object snaps. 
**Tag** checks the tag, if they match, the object snaps. 
**Object** checks the reference to the object, if they match, the object snaps. 


**Use Custom Snap Transform**, when turned on, prompts you with three checkmarks - one for each part of the **Transform**. When an object is snapped into the **Snap Drop Zone**, the object transform is lerped into the zone's **Transform**. It means, that whatever the object snapped, it will always try to fit the object as well into the zone as possible. 
When we turn off some of the checkmarks, these properties are not going to get lerped. 
> Example: I have a **box1** and **box2**, **box2** is the **Snap Drop Zone** and is **larger** in scale than **box1**. When we have all three checkmarks turned on and **box1** gets snapped, it will align with the zone perfectly → it gets the same scale as the larger box2. However, when we turn off the **Scale** checkmark, the Snap Drop Zone (box2) will **NOT** change the scale of **box1** when snapped.
> ![SDZExampleBoxes.png](/img/user/img/SDZExampleBoxes.png)



**Lerp Duration** means how long should the aligning (lerping) take when snapped.


There are also some **Events** available, again - the names make them self explanatory. 

---
### TriggerAction.cs

Trigger scripts usually have one purpose - to run an event when something enters their trigger collider. **Trigger Action** is the most basic one, as it has only a few **Events** and the **Identification Type** parameters. 
![TriggerAction.png](/img/user/img/TriggerAction.png)

--- 
### TriggerStay.cs

This one is a little more complex. It requires the user to stay in the trigger collider for some amount of time - **Time To Complete**. 
![TriggerStayExample.png](/img/user/img/TriggerStayExample.png)

There are two **Modes** available: 
- **Reset**
- **Save**

When **Reset** is chosen, the time required to complete the **Trigger Stay** resets every time when the object goes out of the trigger collider.
**Save** (as the name suggests) saves the time and doesn't reset when the object exits the trigger collider. 
>Example: The **Trigger Stay** is set to Reset **and** the **Time To Complete** is 4 seconds. User puts the required object inside the trigger collider and after 2 seconds pulls the object out. The time gets reset and they are now required to hold the object inside for 4 seconds again. 
>When set to **Save**, user puts in the object for 2 seconds and then exits, the time is saved, so the user only needs to put the object into the trigger collider for the remaining 2 seconds, thus adding up to 4 seconds and completing the **Trigger Stay**.


---
### ToggleSelect.cs

The task for the user is to select only a part of the presented options, whether it is objects or some checkmarks in a quiz. For that there is **Toggle Select**. It allows the user to toggle something with a trigger collider. 
![ToggleSelectExample.png](/img/user/img/ToggleSelectExample.png)

**Is Selected** is the default value and on each enter of the collider (that matches the **Identification**), the value gets flipped and the respective **Event** invokes. 