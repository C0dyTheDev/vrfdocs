---
id: streaming
title: 'Streaming'
sidebar_label: 'Streaming'
---

| Dependencies: | none |
| ------------- | ---- |

The Streaming module sends what a camera sees to a trainer watching from outside the headset, so someone
can follow a session without looking over the trainee's shoulder.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Streaming Module**. It adds the **Stream Manager** and a **Stream Camera** parented to the rig's
camera, so out of the box the trainer sees what the trainee sees.

> In 3.0 this was part of the [Platform](/tutorials/modules/platform) module. It is its own module now,
> and it has its own camera rather than borrowing the headset's.

## Stream Manager

![The Stream Manager in the inspector](/img/vault/StreamManagerExample.png)

| Setting | What it is |
| --- | --- |
| **Stream Camera** | The camera whose view is sent. The Scene Builder wires up the one it creates |
| **FPS** | Frames sent per second |
| **Width** / **Height** | Size of the streamed image |
| **Quality** | JPEG quality, 0 to 100 |

The defaults are deliberately modest. Frames are rendered, read back off the GPU, encoded as JPEG on a
worker thread and sent over UDP - a higher resolution or frame rate costs the headset real performance,
and the trainer is watching a supervision feed, not a film.

**Frames are only produced while somebody is watching.** The viewer sends a heartbeat; with no heartbeat
the module renders nothing at all, so a scene with streaming set up and nobody watching costs almost
nothing.

## Streaming a different view

The stream camera is an ordinary camera, so you can put it anywhere: over the trainee's shoulder, on the
machine they are working on, or fixed to a corner of the room. Move the object the Scene Builder created,
or point the module at a camera of your own.

A scene can also switch what is being streamed while it runs - handing the module another camera changes
the view from the next frame on.

> The **Stream Camera** is deliberately left **disabled**. The module renders it by hand for each streamed
> frame; if it were enabled it would also render itself every frame, for nobody.
