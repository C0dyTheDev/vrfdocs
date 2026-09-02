---
id: modules-overview
title: 'Modules Overview'
sidebar_label: 'Modules Overview'
---

The framework is built out of **modules**. A scene has only the ones it uses, and a module you never add
costs you nothing - no object, no code running, no settings to fill in.

## How a module works

Every module is one component - the manager - that sits under the **MANAGERS** marker. **VRCore** finds
the modules in the scene, starts them in order, waits for the ones marked required to report ready, and
then tells the scene it is running.

A module then **registers a service**: the Audio Manager registers `IAudioService`, the Interaction
Module registers `IInteractionService`, and so on. Anything in the scene asks for a service rather than
for the module, so a scene without the module simply gets nothing back instead of an error, and a
project can replace a module with its own version without touching the scenes.

> In 3.0 this was the **Game Director**, a single object everything looked things up on. There is no
> such object in 4.0: **VRCore** starts the modules and nothing else, and it holds no references for
> anyone.

## The modules

| Module | What it is for |
| --- | --- |
| [Interaction](/tutorials/modules/interaction) | The rig, the hands, and everything the trainee touches or picks up |
| [Movement](/tutorials/modules/movement) | Teleporting between marked standing places |
| [Progress](/tutorials/modules/progress) | The process the trainee is being walked through |
| [Localization](/tutorials/modules/localization) | Text, audio and images in several languages |
| [Audio](/tutorials/modules/audio) | Queued playback so instructions never talk over each other |
| [Platform](/tutorials/modules/platform) | Parameters in, report out - the handshake with the LMS |
| [Mistake](/tutorials/modules/mistake) | Checkpoints the trainee gets right or wrong |
| [Minigame](/tutorials/modules/minigame) | Timed parts spread over several scenes |
| [Speech Recognition](/tutorials/modules/speech-recognition) | Finishing a step by saying the right thing |
| [Streaming](/tutorials/modules/streaming) | The trainee's view, sent to a trainer watching |

Add any of them from the **[Scene Builder](/tutorials/getting-started/scene-builder)**.

## Dependencies

Modules are meant to stand alone, and most do. Where one genuinely needs another, the Scene Builder card
says so and adds what is missing:

- **Movement** needs **Interaction** - it moves the rig, and aims with a hand.
- **Minigame** reports its outcomes through **Mistake**, and fades through **Interaction**.
- **Progress** plays its instructions through **Audio**, and reads its text through **Localization** when
  that module is in the scene.

Everything else is optional in both directions. If your project needs something these do not cover, talk
to the VRF Team before working around a module - the framework is meant to be extended rather than
fought.

## Moving from 3.0

- The **Voice React** module is gone. Its replacement is
  [Speech Recognition](/tutorials/modules/speech-recognition), which recognises real sentences offline
  rather than telling "ano" from "ne".
- **Streaming** used to be part of the Platform module. It is
  [its own module](/tutorials/modules/streaming) now, with its own camera.
- **Interaction** was rewritten. Read [its page](/tutorials/modules/interaction) even if you knew the 3.0
  one well.
