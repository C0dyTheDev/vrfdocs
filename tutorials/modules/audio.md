---
id: audio
title: 'Audio'
sidebar_label: 'Audio'
---

| Dependencies: | none |
| ------------- | ---- |

The Audio module makes sure two things never talk over each other. Clips played on the same AudioSource
are **queued**: each waits for the one before it to finish, instead of cutting it off.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** → **Audio
Manager**. It comes with a default AudioSource under the **SOUNDS** marker, which is what plays anything
that does not name a source of its own.

![AudioManagerExample](/img/vault/AudioManagerExample.png)

**Start Volume** is where the app's volume begins.

## Playing something

Use the **Play Audio** component - the **Audio Emitter** card in the Scene Builder gives you one on an
AudioSource already set to 3D and silent on start.

![PlayAudioScript](/img/vault/PlayAudioScript.png)

- **Audio** - which sound, by **localisation key**. Press the big button to pick one from the audio list;
  you can filter, and see which file belongs to which key.
- **Use Custom Audio Source** - play through the AudioSource on this object rather than the module's
  default one. Use it for anything that should come from a place in the room: a machine, a radio, a door.
- **After Audio** - fires when the clip has finished.

Call **Play()** from any event.

> Sounds are addressed by **key**, not by clip, so the same step plays Czech or English audio without the
> scene knowing which. The keys live in the audio list of the
> [Localization](/tutorials/modules/localization) module. A sound that never needs translating goes in
> the same list as an untranslated entry.

## Who else uses it

- The [Progress](/tutorials/modules/progress) module plays each step's instruction through this module,
  and its success sound.
- Anything of your own that wants to say something to the trainee should too. Playing a clip directly on
  an AudioSource works, but it will happily interrupt an instruction the trainee is still listening to.
