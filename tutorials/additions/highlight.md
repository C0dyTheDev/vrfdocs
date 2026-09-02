---
id: highlight
title: 'Highlight'
sidebar_label: 'Highlight'
---

**Highlight** draws attention to an object - and, by default, to everything under it - by pulsing a
colour over it. Enabling and disabling the component turns the highlight on and off, and the original
materials are always put back.

There are two **Types**:

- **Overlay Color** keeps the object's own materials and pulses a colour over them, so the object looks
  like itself with the light of the highlight on it.
- **Transparent Replacement** swaps every material for a transparent highlight material, pulsing between
  invisible and the colour you chose.

![HighlightExample](/img/vault/HighlightExample.png)

- **Color** - what colour it pulses in.
- **Frequency** - pulses per second.
- **Intensity** - how strong the pulse is.

## Where it comes from already set up

- A **Grabbable Object** adds a Highlight when you add it, preset to the yellow overlay the hands switch
  on, and leaves it **disabled**.
- A **Snap Drop Zone** brings a blue transparent one.
- The Scene Builder's **Highlightable** card adds a disabled yellow one to anything else, ready for a
  scenario step to switch on.

That is the normal way to use it: leave the component disabled and enable it from an event when the
trainee should be looking at this thing.

> The colours and the highlight material come from the project settings - **Edit** → **Project
> Settings** → **VR Framework Settings**. They are set up for you; change them there rather than per
> object if you want the whole app to highlight differently.
