---
id: platform
title: 'Platform'
sidebar_label: 'Platform'
---

| Dependencies: | none |
| ------------- | ---- |

The Platform module is the handshake with whatever launches the session - the LMS, the platform, a
launcher. It reads the parameters the session was started with, hands them to the app, and posts a report
back when the session ends.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Platform Manager**. It survives scene loads, so one is enough for the whole app.

> Streaming the trainee's view used to be part of this module. It is
> [its own module](/tutorials/modules/streaming) now.

## Platform Manager

![PlatformManagerExample](/img/vault/PlatformManagerExample.png)

Two things to fill in:

- **Config** - a **PlatformConfig** asset, the app's own parameters. Create one with **Right click** in
  the Assets window → **Create** → **VRFramework** → **Platform** → **PlatformConfig**.
- **Report Settings** - how the finished report is delivered: the report version, which HTTP status codes
  count as delivered, how many attempts before the queue gives up, and how long it waits between them.
  The defaults are right unless the platform team tells you otherwise.

The manager also owns the session clock and the end of the session: it can end the app when the maximum
game time runs out, and it posts the report on the way out.

## Parameters

There are two halves to a parameter, and they live in different places.

### Internal parameters - what the app reads

These are in the **PlatformConfig** asset.

![ParametersExample](/img/vault/ParametersExample.png)

Under **Custom Parameters**, each has a **Name** and a **Default Value**. The default is what the app
uses when the platform does not send that parameter - which is what happens every time you press Play in
the editor, so a sensible default is what makes the app runnable without the platform.

**Main Parameters** holds the two that are built in: the **Selected Language** the session asks for, and
**Use Max Game Time** with its **Max Game Time**, in seconds, which ends the app when it runs out.

### Platform data - what the platform offers

What the platform *shows* to whoever sets up a session is declared per build, in the Build window:
**VRFramework** → **Build** → the build profile's **Platform Data** section.

![Platform Data on a build profile](/img/vault/BuildWindowExample.png)

There you list the **scenes** this build offers:

- **Name** - what the person setting up the session sees.
- **Value** - the identifier the platform sends back, conventionally `<stream>_<nazev_appky>`.
- **Parameters** - the parameters that scene accepts.

At build time this is written into StreamingAssets as `MyData.json`, which is what the platform reads off
the installed app. Values that come back from the platform are mapped onto the internal parameters by
**name**; anything missing keeps its default.

> Example: an app called **IAC Flexi 1** under VR Training gets **Name** `IACFlexi1` and **Value**
> `VRTraining_IACFlexi1`.

> The Validator checks this for you: a build with no scenes declared, a scene with no value, or a
> parameter with no name are all reported before you build.

## Reacting to a parameter

**React On Parameter** is how a scene changes according to what the session was started with.

![ReactOnParameterExample](/img/vault/ReactOnParameterExample.png)

Pick the **Parameter Name** from the dropdown - it lists what is in the PlatformConfig - and give it the
**Expected Value**. When the app starts, the parameter either matches, and the **correct value** event
fires, or it does not, and the **wrong value** event fires.

> Example: `Param1` defaults to `scenario1`, and a React On Parameter expects `scenario1`. Launched from
> the platform with `scenario2`, the **wrong value** event fires. Launched locally with no platform, the
> parameter falls back to its default, matches, and the **correct value** event fires.

## The report

The session report is not a fixed shape. It is whatever the scene's **report contributors** hand over:
the [Mistake](/tutorials/modules/mistake) module contributes its checkpoints, and your own scripts can
contribute anything else. The Platform Manager collects it, serialises it and posts it.

A contributor in a scene that unloads before the session ends - one part of a
[minigame](/tutorials/modules/minigame) chain, say - freezes its data on the way out, so what it found is
still in the final report.
