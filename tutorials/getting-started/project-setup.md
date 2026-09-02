---
id: project-setup
title: 'Project Setup'
sidebar_label: 'Project Setup'
---

This walkthrough takes you from a clean Unity project to one that builds and runs on a headset, with
VR Framework 4.0 installed through the **VR Framework Package Manager**.

## 0) Prerequisites

- **Unity 6000.5** (the version this documentation was written against is **6000.5.10f1**).
- **Android Build Support** installed for that Unity version, including **OpenJDK** and **Android SDK
  & NDK Tools**. The setup checks for it and stops if it is missing.
- Access to the VR Framework group on GitLab. If you do not have it, contact Michal Kulhánek.

---

## 1) Create your Unity project

1. Open **Unity Hub** → **New project** → **Universal 3D** (URP) template.
2. Pick the Unity version above.
3. Name it, set the location, and create it.

> Do not add anything else yet. The framework setup rewrites project settings, so it is easiest on a
> project nobody has configured by hand.

---

## 2) Install the VR Framework Package Manager

1. Open Unity's own **Package Manager** (**Window** → **Package Manager**).
2. Click the **+** in the top-left corner.
3. Choose **Install package from git URL...**
4. Paste `https://git.cie-group.cz/vr-framework/vrf4/vrfpackagemanager.git`
5. Install.

If you are asked to sign in to GitLab, choose the **Token** method. If you have never made an access
token, ask the VRF Team or follow GitLab's own guide.

---

## 3) Install VR Framework Core

Open **VRFramework** → **Packages** → **VRF Package Manager**.

The 4.0 package manager reads a **registry**, so you no longer paste a URL per stream. It shows a card
per package - **Core** first, then the extensions - each with the versions available and what is
currently installed.

1. Press **Refresh** if the list is empty; it fetches the registry index and re-reads what you have.
2. On the **Core** card, pick a version - the newest, unless you were told otherwise - and press
   **Install**.
3. Install any **extension** your project needs the same way. Extensions declare which Core versions
   they work with, and a card is badged **MISMATCHED** when the installed Core is outside that range.

Installing takes several minutes; Unity recompiles a few times along the way.

![VRFPMCompletedState](/img/vault/VRFPMCompletedState.png)

> An extension is what a stream (VR Training, VR Medical, …) or a single project adds on top of Core.
> Core on its own is a complete framework - it is what this documentation describes.

---

## 4) Run the project setup

Open **VRFramework** → **Set Up Project for VR** and press **Set Up Project**.

This is one run that configures everything an Android VR build needs:

- switches the build target to **Android** and checks the build support is there
- copies the framework's settings, resources and editor layout into the project
- installs the packages the framework depends on, and allows pre-release packages
- sets up **XR Plug-in Management** and the **OpenXR** features the framework uses
- sets the **render pipeline** and quality levels
- adds the framework's **tags and layers**, its **physics** setup and fixed timestep
- sets **script execution order** and the **player settings** an Android VR build needs
- imports the **TextMesh Pro** essentials and the XR samples
- installs the platform's **remote shutdown plugin** and creates the **StreamingAssets** it reads
- copies the **speech recognition model** into StreamingAssets
- fetches the framework's **.gitignore**
- sets up the agent tooling: **OpenCode**, Unity's **MCP relay** and bridge, and the primer they read

> **Existing project settings are overwritten.** On a project that is not brand new, commit your work
> first.

Unity recompiles several times during the run. The setup carries on by itself and the window keeps its
place - **leave the editor alone** until the last step reports.

When it finishes, press **Apply VRF Layout** in the same window if you want the framework's window
arrangement (you can also do it later from **VRFramework** → **Appearance** → **Apply VRF Editor
Layout**).

---

## 5) Check the project

Open **VRFramework** → **Validator** and run it, or press **Open Validator** in the setup window.

The **Project** tab tells you whether anything the setup could not decide for you is still missing -
the company and product name, for instance, or the platform plugin. Most findings have a **Fix** button.
See **[Validator](/tutorials/getting-started/validator)** for what it checks.

---

## 6) Build your first scene

Use the **[Scene Builder](/tutorials/getting-started/scene-builder)**: it creates the scene structure,
puts the XR rig in and adds the modules you pick.

When you are ready to make a build, use **VRFramework** → **Build**, which drives Unity's build
profiles with the framework's own settings on top - product identity, version, and whether it is a
production build for the platform.

---

## If something goes wrong

- Restart Unity and run the setup again; it is safe to re-run and picks up where it left off.
- Read the **Console**. The framework's own messages are prefixed **VRFramework:** and say what stops
  working as a consequence.
- Open **VRFramework** → **Logger** for the framework's own log, which is easier to read than the
  console when several modules are starting at once.
- Still stuck? Report it through **Report an issue** in the VRF Package Manager, or contact the VRF Team.
