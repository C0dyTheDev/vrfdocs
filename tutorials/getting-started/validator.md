---
id: validator
title: 'Validator'
sidebar_label: 'Validator'
---

The **Validator** checks your project settings and your open scene against everything the framework
expects, and tells you what will break before you find out in a headset. Most findings come with a
button that fixes them.

Open it with **VRFramework** → **Validator**.

![The Validator window](/img/vault/ValidatorExample.png)

## Reading a finding

Every finding says three things:

1. **What is wrong**, in one line.
2. **What happens at runtime** if you leave it alone.
3. **What to do about it** - and often a **Fix** button that does it for you.

They come at three severities:

| Severity | Meaning |
| --- | --- |
| **Error** | Something will not work at runtime. |
| **Warning** | It works, but not the way the framework expects. Usually bites later. |
| **Info** | Worth knowing about. Nothing is broken. |

Findings are grouped by category, and clicking one selects the object it is about.

## The toolbar

- **Revalidate** - run every rule again.
- **Fix all (n)** - apply every fix currently listed, then re-run.
- **Auto** - re-run whenever the window comes back to the front.
- **To console** - write the whole report to the console and the VRF Logger.
- **Everything / Project / Scene** - which scope to check.
- The three severity toggles and the search box narrow what is listed.

## What it checks

**Project** - things that belong to the project as a whole, and are usually set once:

Framework settings · Build target · XR · Rendering · Tags and layers · Physics · Script execution
order · Player settings · Streaming assets · Platform plugin

**Scene** - the open scene, and only what applies to it. A rule for a module you have not added stays
quiet.

Scene layout · VRCore · Modules · Build · then a rule per module - Audio, Localization, Platform and
its report, Interaction, Grabbable objects, Grab hands, Snap drop zones, Poke surfaces, Minigames,
Mistakes, Streaming, Movement, Speech Recognition - and finally the Scenario: its layout and its
branching.

> The Validator does not have an opinion about how you author your scene. A kinematic rigidbody or a
> trigger collider on a grabbable, for instance, is a supported choice and is not reported - it is only
> not the default.

## When to run it

- After **[Project Setup](/tutorials/getting-started/project-setup)**, to see what the setup could not
  decide for you.
- After building a scene with the **[Scene Builder](/tutorials/getting-started/scene-builder)**.
- Before every build. **VRFramework** → **Validate to Console** does the same run without the window,
  which is what you want from a build step.
