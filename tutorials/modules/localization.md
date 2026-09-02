---
id: localization
title: 'Localization'
sidebar_label: 'Localization'
---

| Dependencies: | none |
| ------------- | ---- |

The Localization module gives you text, audio and images in as many languages as the app needs. Content
is addressed by a **key**; the module hands back whatever that key means in the current language.

It works with the [Platform](/tutorials/modules/platform) module, which sets the language from the
parameter the session was started with.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** → **Language
Manager**.

## Setup

You need four assets and one component in the scene:

- **Language Config** - the languages the app has.
- **Text List**, **Audio List**, **Sprite List** - the content itself.
- The **Language Manager** in the scene, pointed at all four.

Your project template usually ships these. Create new ones with **Right click** in the Assets window →
**Create** → **VRFramework** → **Language** → **LanguageConfig** / **TextList** / **AudioList** /
**SpriteList**.

![LanguageManagerExample](/img/vault/LanguageManagerExample.png)

The module also runs in **edit mode**, so translated text and sprites show in the scene view as you
author them rather than only when you press Play.

> If a list looks empty right after you add a language, click through the lists once or restart Unity -
> Unity does not always notice a new sub-asset straight away. It only happens once, when the config is
> new.

## Adding translations

Each list holds **untranslated** and **translated** entries.

![An audio list](/img/vault/AudioListExample.jpeg)

- A **translated** entry has one file per language in the config.
- An **untranslated** entry has one file, full stop. Use it for sound effects and anything else with no
  words in it.

Each entry has a **key**. Scenes refer to the key and never to the file, which is the whole point: the
scene does not know or care which language is running.

## Audio

Play localised audio with the **Play Audio** component - see the
[Audio module](/tutorials/modules/audio) for what else it can do.

![PlayAudioScript](/img/vault/PlayAudioScript.png)

The big button opens a picker with every key in the Audio List, filterable, showing which file belongs to
which key. Sort by key, or hide translated or untranslated entries.

![PickAudio](/img/vault/PickAudio.png)

**Use Custom Audio Source** plays through this object's own AudioSource instead of the Audio module's
default one - use it for anything that should sound like it comes from a place in the room.

## Graphics

![GraphicsLocalizationModule](/img/vault/GraphicsLocalizationModule.png)

- **Localized Sprite** swaps the sprite of a Sprite Renderer.
- **Localized Texture** swaps a texture on the object's material. The material must be an instance the
  script may modify - not a shared default one. **Material Index** says which material in the renderer's
  list to change, and **Set Emission Map** changes the emission texture alongside the base one.

## Text

**Localized Text** puts a translated string into a TextMeshPro component. The **Localized Text** card in
the Scene Builder gives you a world-space text with the component already on it.

![LocalizedTextExample](/img/vault/LocalizedTextExample.png)

## Changing language at run time

The module raises an event when the language changes, and everything localised in the scene re-reads
itself. You rarely call this yourself: the Platform module sets the language during startup from the
session's parameter.
