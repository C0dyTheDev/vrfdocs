---
id: index
title: 'VR Framework Docs'
sidebar_label: 'VR Framework Docs'
slug: /
sidebar_position: 0
---

![VRFrameworkLogo](/img/vault/VRFrameworkLogo.png)

Welcome to the **VR Framework 4.0** documentation!

The framework gives you a foundation for building VR training applications in Unity: a scene structure
every app shares, hands that behave the same way in every project, and modules you add only when you
need them. It takes care of the plumbing - the rig, the physics, the platform handshake, the
translations - so your work is the training itself.

## Where to start

- **[Project Setup](/tutorials/getting-started/project-setup)** - from an empty Unity project to a
  running VR app.
- **[Scene Builder](/tutorials/getting-started/scene-builder)** - the window that builds your scene for
  you.
- **[Validator](/tutorials/getting-started/validator)** - what the framework checks before you build,
  and how to read what it tells you.
- **[Modules Overview](/tutorials/modules/modules-overview)** - what each module does and when to add it.

## What is new in 4.0

If you have worked with 3.0, these are the things that changed under you:

- **Hands are physical.** The hand you see is a rigidbody that is stopped by walls and feels the weight
  of what it carries. A held object is driven by velocity, never teleported into the palm. See
  **[Interaction](/tutorials/modules/interaction)**.
- **Grips live on the object.** A hand pose is authored at a **Grip Point** placed on the object, not on
  the Grabbable Object component. Several grip points per object are normal, and two hands can hold one
  object at once.
- **Mechanisms.** A door, a drawer, a valve, a lever or a button is a **Grip Constraint** on a grip point
  - no scripting - and a **Grip Sequence** joins several of them into one path.
- **VRCore replaces the Game Director.** Modules are components that register themselves, and nothing
  looks anything up by name any more.
- **New modules:** [Movement](/tutorials/modules/movement) (teleporting),
  [Speech Recognition](/tutorials/modules/speech-recognition) (replaces Voice React) and
  [Streaming](/tutorials/modules/streaming) (split out of the Platform module).
- **A Validator** that checks a project and a scene against all of the above, with a fix button on most
  findings.

> 4.0 does not keep 3.0 components working. A 3.0 project moves over by re-authoring its scenes with the
> Scene Builder, not by a migration script.
