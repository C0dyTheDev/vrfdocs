---
id: converting-a-3-0-project
title: 'Converting a 3.0 Project'
sidebar_label: 'Converting a 3.0 Project'
---

The **VR Framework 3 to 4 Converter** moves an existing VR Framework 3.0 project onto 4.0 in one run:

- from **Unity 6000.2** to **Unity 6000.5.10f1**,
- from the 3.0 package to **Core 4** - and, for Medical apps, **Medical Extensions**,
- and it converts the scenes you pick: the 4.0 rig, **VRCore** and the modules in place of the 3.0 ones.

It is a one-time tool and not part of the VRF Package Manager. You install it into the 3.0 project,
convert, go through the report, then remove it.

## What it converts from

| 3.0 package | Becomes |
| --- | --- |
| `com.vrframework.core` from **VR Framework 3.0 Training** | Core 4 |
| `com.vrframework.vrmedical` from **VR Framework 3.0 Medical** | Core 4 + Medical Extensions |
| `com.vrframework.core` from another 3.0 fork (FZS, CD, ...) | Core 4, with the Training rules |

A fork converts like Training. Whatever the fork added on top of stock 3.0 is not converted - it shows up
in the report instead.

---

## 0) Before you start

- **Commit everything.** The commit is the only way back to 3.0 - the conversion cannot be undone from
  inside Unity. If the project is not in git, copy the whole project folder somewhere safe.
- **Unity 6000.5.10f1** with **Android Build Support**. The converter's window can ask Unity Hub to
  install it for you.
- **Asset Serialization** set to **Force Text** (**Edit** → **Project Settings** → **Editor**). The
  converter rewrites scenes and prefabs as text.
- **Windows.** The step that moves the project to the new editor is a Windows script.
- Access to the VR Framework group on GitLab. If you do not have it, contact Michal Kulhánek.
- **Time.** The new editor reimports the whole project. A small Training app converts in about twenty
  minutes; a large model with **Generate Lightmap UVs** on can take twenty minutes on its own.

---

## 1) Install the converter into the 3.0 project

Open the **3.0 project** in its usual editor (Unity 6000.2).

1. Open Unity's **Package Manager** (**Window** → **Package Manager**).
2. Click the **+** in the top-left corner.
3. Choose **Install package from git URL...**
4. Paste `https://git.cie-group.cz/vr-framework/vrf4/converter.git`
5. Install.

If you are asked to sign in to GitLab, choose the **Token** method.

---

## 2) Open the converter

Open **VRFramework** → **Convert To VR Framework 4**.

The window has four parts:

- **Found** - which 3.0 package the project uses, and its version.
- **Converts to** - the Unity version, and the **Core tag** (plus the **Medical Extensions tag** for a
  Medical project). Leave the tags as they are: they are the releases the converter's rules were written
  against. Another tag may have renamed things the rules do not know about, and the window warns you if
  you change it.
- **Scenes to convert** - see the next step.
- **Before converting** - the checks, see step 4.

---

## 3) Pick the scenes

Only scenes that use the framework are listed; the window tells you how many other scenes it left out.
The scenes in the build are ticked to begin with. Use **Build scenes**, **All** and **None** to change
the selection, and the search field to find a scene by its path.

What ticking a scene means:

- **Every** scene, prefab and asset - ticked or not - gets its script references and renamed fields moved
  over to 4.0.
- A **ticked** scene is converted fully: it also gets the 4.0 rig, VRCore and the modules in place of the
  3.0 ones.

A scene you leave unticked can still be converted later, see
[Converting a scene you did not pick](#converting-a-scene-you-did-not-pick).

---

## 4) Read the checks

Under **Before converting**, every check is a coloured box. A red one is a **blocker** and keeps the
**Convert** button disabled until it is fixed.

| Check | Blocks when |
| --- | --- |
| **3.0 package** | No 3.0 package was found, or the project is already on 4.0. A 3.0 fork is a warning, not a blocker. |
| **Operating system** | It is not Windows. |
| **Unity 6000.5.10f1** | It is not installed, or is installed without Android Build Support. Press **Install Unity 6000.5.10f1 with Unity Hub**; the window finds the editor once the Hub is done. To add only the missing module: Unity Hub → **Installs** → this version → **Add modules**. |
| **Asset serialization** | It is not **Force Text**. Switch it, let Unity reserialize, and commit. |

The warnings do not block, but read them:

- **Version control** - the project is not a git repository, or there are uncommitted changes.
- **Scenes** - none are ticked. The project still moves to 4.0, but no scene gets its rig, VRCore and
  modules; that is left to the [Scene Builder](/tutorials/getting-started/scene-builder).
- **Unsaved changes** - an open scene has unsaved changes. They are saved before converting.

---

## 5) Convert

Press **Convert** and confirm. From here on, **leave Unity alone** - the conversion carries on by
itself across two editors.

1. **In the 3.0 editor** the converter prepares everything in a `VRFConversion` folder next to `Assets`
   and does not touch the project yet:
   - every scene, prefab and asset that 4.0 reads differently, rewritten for 4.0,
   - your own scripts, rewritten for the 4.0 API (see [Your scripts](#your-scripts)),
   - an untouched copy of each of those files in `VRFConversion/snapshot`,
   - everything the project uses out of the 3.0 package that 4.0 does not ship - effects, sounds,
     models - copied out with its GUID, so the references to it still hold,
   - the 4.0 package list: the 3.0 package out, Core 4 (and Medical Extensions) in,
   - the app's identity: company, product, version and Android identifier.
2. **The 3.0 editor closes.** A console window copies the prepared files over the project and opens it
   in Unity 6000.5.10f1. This has to happen outside Unity: the moment the 3.0 package leaves the
   project, nothing in the 3.0 editor compiles - the converter included.
3. **In the 4.0 editor** the converter starts **VRFramework** → **Set Up Project for VR** (the same
   setup as in [Project Setup](/tutorials/getting-started/project-setup)). At its end, the converter's
   own steps run:
   - each ticked scene: the 3.0 components with no 4.0 counterpart removed (GameDirector, the
     photography and voice modules), the 3.0 rig replaced by the 4.0 one in the same place, everything
     that pointed into the old rig pointed into the new one, VRCore and the modules added,
     GameDirector's audio settings moved to the AudioManager, the scene's language kept as a `language`
     platform parameter, Medical scenes wired for Medical Extensions, and the
     [Validator](/tutorials/getting-started/validator) run,
   - the app's identity put back, so the Android identifier does not change - a changed identifier
     installs as a second app next to the old one,
   - the report written and opened.

### The progress window

The console window that opens the 4.0 editor stays open for the rest of the conversion. It shows one
progress bar for the whole conversion and a log underneath: Unity starting, the import, every step of
the project setup, each scene as it is converted, and the report.

**Watch this window, not Unity.** Unity can look frozen for long stretches while it imports the project;
the progress window keeps moving, and tells you when a single model is holding the import up.

If you closed it, or reopened Unity by hand, follow the running conversion again from the project
folder with:

```
powershell -ExecutionPolicy Bypass -File VRFConversion\monitor.ps1 -Project "<project folder>"
```

> A few **Bakery** exceptions in the Console during the first import are expected and do no harm to the
> conversion.

---

## 6) Go through the report

When the conversion finishes, `VRFConversion/Report.md` opens. You can open it again at any time with
**VRFramework** → **Convert To VR Framework 4** → **Open the report**.

It has three parts:

- **To do by hand** - a checkbox for everything the converter could not do, grouped by scene, prefab
  and script: references into the old rig with nowhere to go, 3.0 values 4.0 has no field for (each with
  the value it had), Validator findings, modules 4.0 dropped. Nothing is dropped without the report
  saying so.
- **Always check** - the things no converter can do for you:
  - **Play every scene in the headset.** 4.0 is hand tracking only, so anything a 3.0 scene did with
    controllers has no input any more.
  - **Grab every grabbable.** 3.0 custom grab poses do not carry over. In 4.0 a grip is authored on the
    object as a **Grip Point**; an object without one uses the automatic grip. See
    [Interaction](/tutorials/modules/interaction).
  - The scenes you did not tick, the rescued assets and the clean-up - see the steps below.
- **What the converter did** - everything it changed, per scene and prefab.

Run the [Validator](/tutorials/getting-started/validator) on each converted scene as you go through it.

---

## Your scripts

3.0 kept every framework type in `VRFramework.Core.Runtime` and handed its managers out as singletons.
4.0 splits the types into module namespaces and publishes its services through `RuntimeRegistry`.

The converter adds the module namespaces to every script under `Assets` that uses
`VRFramework.Core.Runtime`, and rewrites every 3.0 call that has exactly one 4.0 counterpart, for
example:

| 3.0 | 4.0 |
| --- | --- |
| `PlatformManager.Instance.parameters.parameters.Find(p => p.name == "x").value` | `RuntimeRegistry.Get<IPlatformService>().GetParameter("x")` |
| `PlatformManager.Instance.paramComplete` | `(RuntimeRegistry.Get<IPlatformService>()?.IsReady == true)` |
| `PlatformManager.Instance.score++` (Medical) | `RuntimeRegistry.Get<IMedicalService>().Score++` |
| `PlatformManager.Instance.score = x` (Training) | `PlatformReport.SetValue("score", x)` |
| `GameDirector.Instance.visionFader` | `RuntimeRegistry.Get<IInteractionService>().VisionFader` |
| `LanguageManager.GetTranslatedText(id)` | `RuntimeRegistry.Get<ILocalizationService>().GetText(id)` |
| `ProgressManager.Instance.StartProgress()` | `RuntimeRegistry.Get<IProgressService>().StartProgress()` |

- A call with no exact counterpart is left as it is and listed in the report, with what to use instead.
- A script keeps its encoding byte for byte, legacy code pages included.
- A script that still does not compile against 4.0 is set aside while the scenes are converted, so one
  broken script does not stop the conversion. Its components keep their data. Afterwards the script is
  put back where it was, the Console shows its errors, and the report lists them. Fix those first - the
  components on it come back as soon as it compiles.

The [API Reference](/api) has the 4.0 types and services.

---

## Converting a scene you did not pick

A 3.0 scene that was not ticked still has its 3.0 rig and no VRCore. Open it and run
**VRFramework** → **Convert The Open 3.0 Scene**. It is converted the same way and added to the report.

The menu item is only available once the conversion has finished.

---

## Clean up

When the project is right:

1. Go through `Assets/VRF3 Rescued`. Everything in it was used by the project out of the 3.0 package.
   Keep what is still used, move it where it belongs, and delete the rest.
2. If the report mentions XR sample folders ending in `~`, delete them once the scenes look right. They
   are the 3.0 copies, set aside so the setup could import the current ones.
3. Remove the converter: **VRFramework** → **Convert To VR Framework 4** → **Remove the converter
   package**.
4. Delete the `VRFConversion` folder, or commit it as a record of the conversion.
5. Commit.

---

## Converting without the window

For a build machine, or many projects at once, the same conversion runs from the command line. In a
Windows command prompt:

```
Unity.exe -batchmode -quit -projectPath <3.0 project> ^
    -executeMethod VRFramework.Converter.BatchConvert.Stage ^
    -vrfScenes build
VRFConversion\handoff.cmd "<3.0 project>" -
Unity.exe -batchmode -projectPath <3.0 project>
```

- The first `Unity.exe` is the project's 3.0 editor, the last one is Unity 6000.5.10f1, which closes by
  itself when the conversion is done.
- `-vrfScenes` takes `build`, `all`, `none`, or a list of scene paths separated by `;`
  (`Assets/A.unity;Assets/B.unity`).

---

## If something goes wrong

- **The project was prepared, but never moved over.** Open the converter window: it says so and gives
  the command to run by hand. Close Unity first, then run it.
- **Unity was closed during the conversion, or the project setup stopped.** Open the project in Unity
  6000.5.10f1 again: the converter starts the project setup once more, and the scenes are converted at
  its end. Use the `monitor.ps1` command above to see its progress. If the setup stops a second time,
  the Console says so - fix what stopped it and run **VRFramework** → **Set Up Project for VR** yourself;
  the conversion still runs at its end.
- **You want to start over.** Go back to the commit you made before converting, delete the
  `VRFConversion` folder, and convert again.
- Still stuck? Send the report and `VRFConversion/progress.log` to the VRF Team, or use
  [Report a bug](/report-bug).
