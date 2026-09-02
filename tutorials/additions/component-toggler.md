---
id: component-toggler
title: 'Component Toggler'
sidebar_label: 'Component Toggler'
---

![ComponentTogglerExample](/img/vault/ComponentTogglerExample.png)

**Component Toggler** switches a list of components on or off from a single event - the usual way a
scenario step opens up or shuts down a group of interactions at once.

Pick a **Component Type**, then fill the list. Two buttons do the filling for you:

- **Insert From Scene** - every component of that type in the scene.
- **Insert From Children** - every one below this object.

**Clear List** empties it again, and **Enable All** / **Disable All** flip everything in it right now, so
you can check you picked the right things without pressing Play.

Call **ToggleComponents(true)** or **ToggleComponents(false)** from any UnityEvent.

> The interaction rig uses one of these per hand, which is how a step can take grabbing away without
> touching each grabbable in the scene.
