---
{"dg-publish":true,"dg-path":"Modules/Progress.md","permalink":"/modules/progress/","noteIcon":""}
---


| Dependencies: | [[web/Modules/Localization\|Localization]] [[web/Modules/Platform\|Platform]] [[web/Modules/Audio\|Audio]] |
| ------------- | --------------------------------------- |

There are apps that are specifically created for a purpose of training its user to do some kind of process. For implementing and managing this process in our app, we use the **Progress Module**.

---
## Setting up

To setup the **Progress Module**, we need the **Progress Manager** script in the scene. It looks like this in the editor: 
![ProgressManagerExample.png](/img/user/img/ProgressManagerExample.png)
There are a few settings to cover. First one is the **Start Block** and we will cover this one later. **App Mode** is an advanced setting which basically changes the entire behavior of the **Progress Module** and how it works with **Progress Blocks** and **Progress Steps**. 
**Education** processes only one **Step** at a time, making the process very controlled. **Testing** basically throws all the **Steps** of the **Block** at the user at once, so they can skip various steps and make **mistakes** in the process (for **Mistake** management, refer to the [[web/Modules/Mistake\|Mistake Module]]).
**App End Sound** is the sound which plays at the end of the app, when the process is finished. 


Another scripts we need in the scene is called **Scenario** and **Graph Updater**. We put these onto a **separate object** that is **located in the root of the scene**. **Scenario** will contain all of the data of the process. 
![ScenarioExample.png](/img/user/img/ScenarioExample.png)
>You don't need to set anything here, they just have to be there.


---
## Basic Principles

The entire concept is based on tracking the users progress through the process. Each step in the process corresponds to one **Progress Step** in the scene. The steps are divided into **Progress Blocks**. **Progress Blocks** make **conditional routing** possible. Refer to the diagram for an example of the structure: 
![ProcessExample.png](/img/user/img/ProcessExample.png)
This is a simplified process showcasing **conditional branching** and how can we divide the steps into logical blocks. An important thing to note is that blocks can have **only one input** (you can only enter a block from Step1), but you can exit the block from any **Step** you want. 

>Note: An app can have **multiple** **End** steps, but only **one** **Start**. 


Let's take a closer look on how we would create such process in the editor. 

---
## Creating the process

To create a process, there is a handy tool which neatly visualizes the entirety of it the same way as in the example above. It is called Progress Graph Editor. To open it, go to **VR Framework** → **Graph Tools** → **Progress Graph Editor**.

When opened, you very possibly see just an empty grid. **Right Click** anywhere in the grid to show the context menu. Click **Create new block** and a **Progress Block** appears. This is the **Block** we talked about earlier, it can contain **Steps** and is a logical divider of the process. You can rename it and create **Steps** inside it with the **+** button.

When you create a second **Block**, you can connect them by dragging any of the **Steps** output port over to the input port of the second **Block**. A dialog appears which asks you if you want just a **regular route** or if you want a **conditional branch**. 

Let's create the direct translation of the process shown above using the **Progress Graph Editor**: 
![ProgressGraphExample.png](/img/user/img/ProgressGraphExample.png)

To mark a block as a **Start Block**, we need to assign it into the **Progress Manager**:
![StartBlockSetting.png](/img/user/img/StartBlockSetting.png)

As you can see, there are some blue routes and one green. The blue ones are called **Constant routes**, they just connect the blocks. The green one is the **Conditional branch** - specifically the **True** **branch**. 

When we take a look at what is happening in the scene, we can see that under the **Scenario** object, we have multiple new objects created - one for each **Block**.
![Blocks.png](/img/user/img/Blocks.png)
And under each of the **Blocks** are objects representing the **Steps**.
![Steps.png](/img/user/img/Steps.png)

Blocks don't really carry any more settings other than the name - they serve the one and only purpose of being just a logical divider of the process, nothing more. 

Steps, however, have all of the logic inside. When we select a step, we are greeted with these settings:
![ProgressStepExample.png](/img/user/img/ProgressStepExample.png)

There is the name and a bunch of events and settings. 


**Before Event** invokes right at the beginning of the step, when it becomes active in the process.
**Audio** is what should be played - this is usually instructions on how to complete the step or some information for the user. 
**After Audio Event** invokes right after the **Audio** finishes playing. 
**Play Success** is whether completing the step should play the **Success** sound set in the **Game Director**. 
**After Complete Event** invokes right after the step is completed.
**Delay To Next** is the time it should wait until going over to the next step. 

>Note: When a **Progress Step** becomes active in the process, it is active in the **Hierarchy** as well. When the **Step** is completed, it is deactivated in the **Hierarchy**, so if you need to have some objects activated only when the **Step** is active, put them as a child under the **Step**. If you need objects active through multiple steps, put them into the **Dynamic Objects** section. 



So to recapitulate this - we can now create **Blocks**, **Steps** and **configure the process**. But how do we configure the **connections** between the blocks? 


When you click on one of the **Steps** that have a route going from them to another **Block**, there is an additional script attached. If there is a blue route, there is a **Constant Enqueue**: 
![ConstantEnqueueExample.png](/img/user/img/ConstantEnqueueExample.png)

As you can see, there is the **Block To Enqueue** which corresponds to the connected **Block** in the **Graph Editor**. The other settings require a deeper understanding of how the **Progress Manager** works and manages the **Steps**, so let's take a closer look at that. 

---
## Step Queue

The entire process management is built on a single data structure - **Queue**. When we start a **Block**, all of its **Steps** are put into the **Queue**. The important thing to note is that **Queue** is a **FIFO** data structure - **First In**, **First Out**. It is exactly the same principle as a waiting queue at the doctor. The one who came first goes first, second goes second and so on. So when we apply that logic to the **Progress Manager**, it always sets active the first step that is in the **Step Queue**. 



![ConstantEnqueueExample.png](/img/user/img/ConstantEnqueueExample.png)
So now the settings in the **Constant Enqueue** make a little bit more sense. When we enqueue a **Block**, it can **Delete Step Queue** before it goes into the **Queue** and we can choose where to put the new **Steps** in the **Queue** - either the **End** or we can skip the waiting, piss-off some of the people that were here first, and go to the **Start** of the **Queue**. 


Let's take a look at the **Conditional Enqueue**. Click on one of the steps that have a green or a red route going from them to another block and you will see the script: 
![ConditionalEnqueueExample.png](/img/user/img/ConditionalEnqueueExample.png)

There are **Conditions** and **Conditions Required**. **Conditions** are booleans that can be marked as true or false. **Conditions Required** set the number of the required conditions to be true to go to the **True branch** or, if not met, the **False branch**. When set to -1, it requires all of the **Conditions** to be true to go to the **True branch**.
