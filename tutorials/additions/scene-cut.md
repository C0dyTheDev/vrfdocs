---
id: scene-cut
title: 'Scene Cut'
sidebar_label: 'Scene Cut'
---

![SceneCutExample](/img/vault/SceneCutExample.png)
This script is useful when we want to change multiple things in the scene but we don't want to break the user's immersion by showing them the change. When **Cut()** is called, it dims the user's view using **Vision Fader**, invokes the **On Cut Event**, then fades out the **Vision Fader** and after that invokes the **On Fade Out Event**.
