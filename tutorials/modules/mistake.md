---
id: mistake
title: 'Mistake'
sidebar_label: 'Mistake'
---

| Dependencies: | none |
| ------------- | ---- |

The Mistake module is the scene's list of things the trainee is expected to get right. Each one is a
**checkpoint** that ends the session either done or not done, and the module hands the results to the
[Platform](/tutorials/modules/platform) report.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** → **Mistakes
Manager**.

## Setting it up

![MistakeManagerExample](/img/vault/MistakeManagerExample.png)

- **Mistake Platform** - the asset the results are collected in, so they survive the scene changes of a
  [minigame](/tutorials/modules/minigame) chain. Create one with **Right click** in the Assets window →
  **Create** → **VRFramework** → **Mistake Platform**. Nothing to configure inside it.
- **Scene Name** - what this scene is called in the results. Left empty, the scene's own name is used.
- **Mistakes** - the checkpoints themselves.

Each checkpoint has:

- **Mistake Name** - what you tick it off by, from an event or from script.
- **Display Name** - what the results show, which may be a whole sentence.
- **Done** - whether it has been done correctly. Start it unticked.

## Ticking a checkpoint off

From any UnityEvent - a trigger, a snap drop zone, a progress step - call:

- **CheckMistake(name)** - the trainee did it right.
- **UncheckMistake(name)** - they got it wrong after all.

![CheckMistakeExample](/img/vault/CheckMistakeExample.png)

Into the field goes the **Mistake Name**.

> Both directions matter. A checkpoint ticked off when the trainee does the right thing can be unticked
> later when they undo it - fitting a part correctly and then removing it again is not a pass.

## What ends up in the report

The module contributes its scene's results to the session report under **Mistakes**, and the platform
shows the **Display Name** of everything not done.

> Example: the trainee misses `mistake3`, so nothing calls `CheckMistake(mistake3)`. At the end, the
> report lists that checkpoint by its display name alongside anything else they missed.

The results are per scene, and they survive scene loads: a chain of scenes each contributes its own, and
the report at the end carries all of them.
