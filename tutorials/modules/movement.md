---
id: movement
title: 'Movement'
sidebar_label: 'Movement'
---

| Dependencies: | [Interaction](/tutorials/modules/interaction) |
| ------------- | --------------------------------------------- |

The Movement module lets the trainee move themselves around the scene, between places you have marked as
somewhere they are allowed to stand.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Movement Module**. It adds the module, the aiming arc and a first **Teleport Point** on the floor
under the rig.

## How the trainee teleports

There is no controller and no button. With hand tracking:

1. **Hold a palm up** - the arc appears and starts aiming.
2. **Point** the arc at a Teleport Point. It highlights when the arc is on it.
3. **Close the hand into a fist** - the view fades out, the rig moves, the view fades back in.

Aiming stops the moment the palm is turned away, so a hand doing something else never teleports by
accident.

## Teleport Points

A **Teleport Point** is one place the trainee may stand. Put one wherever standing makes sense; they are
placed under the **TELEPORTS** marker.

![A Teleport Point in the inspector](/img/vault/TeleportPointExample.png)

A Teleport Point *is* a [Player Recenter](/tutorials/additions/player-recenter): it carries the same
settings for where the head ends up, whether the rotation is matched, and whether the player's height is
set. Teleporting to a point and recentering the player onto it are the same operation.

Each point can also:

- draw a **pedestal** model that fades in while the trainee is aiming, and
- **shrink** as the trainee gets near it, so the marker for where you are standing does not sit in your
  face. The near and far distances, the smallest size and how quickly it follows are all on the point.

**Events**: **On Select** and **On Deselect** fire as the arc lands on the point and leaves it - the
place to light something up or play a small sound.

## Switching movement off

A step often needs the trainee to stay where they are. The module can be switched off and on again from
any event, and while it is off the arc does not appear at all.

The module also knows **where the trainee is standing** - the point they teleported to, or the one they
are near - which is what a step means when it asks "is the trainee at the machine?".

> Placing the player somewhere *unmarked* is not this module's job. That is a scripted move, done with a
> [Player Recenter](/tutorials/additions/player-recenter) or through the interaction service.
