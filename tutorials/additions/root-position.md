---
id: root-position
title: 'Root Position'
sidebar_label: 'Root Position'
---

![RootPositionExample](/img/vault/RootPositionExample.png)

**Root Position** watches hand tracking coming and going. While a hand is untracked - the headset cannot
see it - whatever that hand is holding is hidden, so a held object does not float about on its own in
front of the trainee. The renderers are put back exactly as they were once tracking returns.

It has four events, so a scene can react to tracking itself:

- **On Left Hand Tracking Acquired** / **On Left Hand Tracking Lost**
- **On Right Hand Tracking Acquired** / **On Right Hand Tracking Lost**

Use them for a hint telling the trainee to bring their hands back where the headset can see them, or to
pause something that needs both hands.
