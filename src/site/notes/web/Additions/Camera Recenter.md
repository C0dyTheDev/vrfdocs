---
{"dg-publish":true,"dg-path":"Additions/Camera Recenter.md","permalink":"/additions/camera-recenter/","noteIcon":""}
---

![CameraRecenterExample.png](/img/user/img/Examples/CameraRecenterExample.png)
**Camera Recenter** takes the user and positions their head to the position and rotation of the **Camera Recenter**. Before teleporting, it darkens the screen through the **Vision Fader** under the user's camera and after teleporting, the vision fader fades out. **Before Recenter Event** invokes right before the player is teleported (not before the **Vision Fader** fades in), **After Recenter Event** invokes right after the player is teleported and **After Fade Out Event** invokes when the **Vision Fader** finishes fading out.



**Set Player Height**, when set to true, sets the player's height according to the **Y level** of the **Camera Recenter** object. If false, it doesn't set the player height at all, just the **X** and **Z**. This is useful for cases where we don't know whether the player is in the same height as he was at the beginning of the app - f.e. when they were sitting and then they stand up. If that happened, we don't want to set the height again, since we would effectively shift his entire world up or down, making the app unplayable.