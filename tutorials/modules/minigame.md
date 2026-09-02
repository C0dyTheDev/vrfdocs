---
id: minigame
title: 'Minigame'
sidebar_label: 'Minigame'
---

| Dependencies: | [Mistake](/tutorials/modules/mistake), [Interaction](/tutorials/modules/interaction) (for the fade) |
| ------------- | ----------- |

The Minigame module runs a training session as a chain of **parts**, each its own scene, each optionally
on a clock. It decides what loads next, including where to send a trainee who ran out of time.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** → **Minigame
Manager**.

## Minigame Manager

![MinigameManagerExample](/img/vault/MinigameManagerExample.png)

- **Minigames** - the **Minigame Set** asset describing the parts.
- **Should Use Time** - whether the parts are timed at all. Off, the times in the set are ignored.
- **Counter Text** / **Parts Text** - where the countdown and the part number are shown to the trainee.
- **On Fail** - fires when the clock runs out, or when something calls **FailedPart()**.

The manager records how each part went - finished in time or not - through the
[Mistake](/tutorials/modules/mistake) module, so the outcomes reach the session report with everything
else.

## The Minigame Set

Create one with **Right click** in the Assets window → **Create** → **VRFramework** → **Minigame Set**.

![MinigamesSettingsExample](/img/vault/MinigamesSettingsExample.png)

Each **part** is one loadable step of the chain:

| Setting | What it is |
| --- | --- |
| **Real Time** | How long the trainee actually has |
| **Shown Time** | What the countdown displays |
| **Scenes To Load Names** | The scenes that can serve as this part. One is picked at random |
| **On Failed Return To Level** | Which part to go back to when this one is failed |

**Real Time** and **Shown Time** are deliberately separate: showing a slightly longer time than the
trainee really has keeps the pressure honest without the clock looking unfair.

**On Failed Return To Level** is what makes the chain adaptive - failing a late part can send the trainee
back to practise an earlier one instead of ending the session.

> Every scene named here must be in the build. The **start scene** must be at build index 0. The
> [Validator](/tutorials/getting-started/validator) checks the scenes of the open chain for you.

## Progress through the set

The progress through the chain lives on the **asset**, not on the manager, so it survives the scene load
between parts. It is reset when the app quits, so a fresh session starts at the first part.
