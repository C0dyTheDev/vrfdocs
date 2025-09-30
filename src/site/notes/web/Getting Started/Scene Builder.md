---
{"dg-publish":true,"dg-path":"Getting Started/Scene Builder.md","permalink":"/getting-started/scene-builder/","noteIcon":""}
---

The **Scene Builder** allows you to setup and customize your scene according to your needs. To open, go to: **VRFramework** → **Scene Builder**. 

It looks like this (the scene modules might differ in your version):
![SceneBuilderExample.png](/img/user/img/SceneBuilderExample.png)

First of all, there is a big button at the top-right corner - **Basic Scene Setup**. This button setups your scene with basic structure and a **Game Director** instance. 
>Warning: **Basic Scene Setup DELETES** your **entire scene** before setting up the structure. 


Then there are **Scene Modules**. These are modular pieces that you can add to your scene. Each of the modules is described in the **[[web/Modules/Modules Overview\|Modules Overview]]** and their respective documents. 

>Note: Every module might have **dependencies** to work correctly, which are automatically added to the scene when you add the module. There can only be **one instance** of every module in one scene.


After the setup, the scene should look something like this: 
![SceneExample.png](/img/user/img/SceneExample.png)

Don't forget to setup your **additional modules** like Language Manager, Platform Manager, etc.