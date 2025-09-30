---
{"dg-publish":true,"dg-path":"Getting Started/Project Setup.md","permalink":"/getting-started/project-setup/","noteIcon":""}
---

This walkthrough takes you from a clean Unity project to a VR Framework enabled one, installed through the **VR Framework Package Manager**.

## 0) Prerequisites

- Unity: 6000.1.2f
- Access to VR Framework group on GitLab - if you do not have access, please contact Michal Kulhánek.
---
## 1) Create your Unity project

1. Open **Unity Hub** → **New project** → Choose a **3D template** (**URP**).
2. Select the correct Unity version.
3. Name it, set location, and create.
---
## 2) Install VR Framework Package Manager

1. Open Package Manager.
2. In the left top corner, click the **+** button
3. Select **Install Package from Git URL...**
4. Paste this URL: https://git.cie-group.cz/vr-framework/vrfpackagemanager.git
5. Install.
---
## 3) Install VR Framework

Note: 
>The Git URL will differ with each project. Each stream has a distinct version of the package, here are the URLs for them:
> 
>**VR Training**: https://git.cie-group.cz/vr-framework/vr-framework-3-0-training.git
>**VR School**: Not created yet.
>**VR Medical**: https://git.cie-group.cz/vr-framework/vr-framework-3-0-medical.git
>
>The choice depends on the stream under which does the project belong. There might also be projects that require a specific setup of the VRF - in that case, you should be provided with a specific URL. 

1. Open **VR Framework** → **VRF Package Manager**
2. Paste your URL into the **Source**. 
3. Click **Fetch Versions**.
	If you are prompted to sign-in to GitLab, you must choose the **Token** method. If you do not know how to create an access token, please consult Google/ChatGPT or VRF Team.
4. Hit **Install** on your desired version - choose the most recent version if not instructed otherwise.
	This will take around 5-10 minutes, so now is a good time to make some tea or coffee :) 

The VRF Package Manager should now look something like this: 
![VRFPMCompletedState.png](/img/user/img/VRFPMCompletedState.png)

---
## 4) Run the automatic setup

The setup has 3 parts, please run them in this specific order:
1. **VR Framework** → **Reset and Setup Project**
2. **VR Framework** → **Reset and Setup Samples**
3. **VR Framework** → **Reset and Setup Editor**
![SetupButtons.png](/img/user/img/SetupButtons.png)

If any errors occur, restart the project and try again and if the errors persist, contact VRF Team.
