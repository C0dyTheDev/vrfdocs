---
id: scene-builder
title: 'Scene Builder'
sidebar_label: 'Scene Builder'
---

The **Scene Builder** is how a VR Framework scene gets built. It creates the scene structure, adds
modules, drops in ready-made interaction objects and pulls assets in from the Asset Manager library.

Open it with **VRFramework** → **Scene Builder**.

![SceneBuilderExample](/img/vault/SceneBuilderExample.png)

## The categories

Down the left side are the categories. Each lists cards you can add to the open scene; the search box,
the **group** filter and **Hide placed** narrow the grid.

### Modules

The framework modules. Adding one places its manager under the **MANAGERS** marker, wires up whatever it
needs and registers it with **VRCore**.

| Group | Card | What it adds |
| --- | --- | --- |
| Foundation | **Scene Scaffold** | The marker hierarchy, a directional light and **VRCore** |
| Foundation | **VRCore** | The lifecycle coordinator on its own, for a scene that already has a hierarchy |
| Modules | **Audio Manager** | Queued audio playback plus a default AudioSource under SOUNDS |
| Modules | **Language Manager** | Translations for text, sprites and audio |
| Modules | **Platform Manager** | The handshake with the platform: parameters, report, completion |
| Modules | **Mistakes Manager** | Checkpoints the trainee can get right or wrong |
| Modules | **Interaction Module** | The XR rig prefab - tracked hands, physics hands, grab hands, vision fader |
| Modules | **Progress Manager** | The scenario graph: blocks, steps and conditions |
| Modules | **Minigame Manager** | Timed parts across several scenes |
| Modules | **Movement Module** | Teleporting between Teleport Points |
| Modules | **Speech Recognition Module** | Offline speech-to-text, so a step can be finished by speaking |
| Modules | **Streaming Module** | The trainee's view, streamed to a trainer watching |

Each module is described in the **[Modules Overview](/tutorials/modules/modules-overview)** and on its
own page.

> A card that lists **Requires** needs another module in the scene first - the Movement Module needs the
> Interaction Module, for instance. There can be only one of each module in a scene, and one that is
> already there is marked as installed.

### Components

Ready-made objects: a **Grabbable Object**, a **Snap Drop Zone**, a **Trigger Area**, a **Localized
Text**, a **Counter**, and so on. Drop a card onto an object in the hierarchy to set that object up, or
add it on its own to get a new object with the components already configured.

They are grouped by **Interaction**, **Audio**, **Localization**, **Flow** and **Camera**.

### Assets

The Unity **Asset Manager** library, if your project is signed in and has a source configured. Prefabs
and models drop into the scene, sounds become an AudioSource under **SOUNDS**, and textures, materials
and videos import only.

### Scene Templates

Reusable scene setups, saved out of a scene you already built.

- **Add** merges the template's scene into yours and tops up any modules it is missing.
- **Replace Scene** wipes the open scene first, and asks before it does.
- **Open Template Scene** is the only way to bring lighting and other scene-wide settings across.

Make one with **Save Scene as Template** once a scene is set up the way you want it.

---

## The scene structure

The scaffold creates a flat set of **marker objects** that everything else sorts itself into:

```
ENVIRONMENT
LIGHTING
CAMERA
SOUNDS
TELEPORTS
MANAGERS
SCENARIO
```

They are empty objects used as headers in the hierarchy - the framework places each new object after the
marker it belongs to. Markers are created on demand, so you rarely need to run **Scene Scaffold** by
hand; adding any module creates what it needs.

After adding the scaffold and a few modules, a scene looks like this:

![SceneExample](/img/vault/SceneExample.png)

---

## What to add first

For a normal training scene:

1. **Interaction Module** - the rig. Everything the trainee does needs it.
2. **Audio Manager** and **Language Manager** - instructions and translations.
3. **Progress Manager** - if the app walks the trainee through a process.
4. **Platform Manager** - if the app is launched by the platform and reports back to it.
5. Anything else the app actually uses.

Then check the scene with the **[Validator](/tutorials/getting-started/validator)**. It knows what each
module needs and tells you what is missing before you put a headset on.
