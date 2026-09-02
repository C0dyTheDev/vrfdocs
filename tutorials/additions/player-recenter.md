---
id: player-recenter
title: 'Player Recenter'
sidebar_label: 'Player Recenter'
---

![CameraRecenterExample](/img/vault/CameraRecenterExample.png)

**Player Recenter** puts the trainee somewhere: it moves the XR rig so the headset ends up at this
object's position and rotation. The view fades out before the move and back in afterwards, so nobody is
teleported with their eyes open.

> This was called **Camera Recenter** in 3.0.

**Set Player Height**, when on, also matches the height of this object. Leave it off when you do not know
whether the trainee is standing or sitting - setting the height then shifts their whole world up or down.
With it off, only the X and Z are set.

**Play On Start** recenters as soon as the scene loads, which is the usual way to put the trainee in the
right place at the beginning.

**Events**:

- **Before Recenter** - just before the move, after the view has faded out.
- **After Recenter** - just after the move, before the view fades back in.
- **After Fade Out** - once the view is back.

## Teleport Points

A [Teleport Point](/tutorials/modules/movement) *is* a Player Recenter with a pedestal and an arc to aim
at it. If the trainee should be able to choose to go there, use a Teleport Point; if the app decides,
use a Player Recenter and call it from an event.

## VR point

The remaining settings are for the physical VR point some installations have - a marked spot on the real
floor. The **VR Point Parameter** names the platform parameter that says which spot the trainee is
standing on, and the offsets say where this recenter sits relative to it. Leave the parameter blank to
switch the whole thing off; the defaults are right when it is used.
