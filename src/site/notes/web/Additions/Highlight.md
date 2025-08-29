---
{"dg-publish":true,"dg-path":"Additions/Highlight.md","permalink":"/additions/highlight/","noteIcon":""}
---

**Highlight** takes the object mesh and highlights it with a **Color** of your choosing. 
There are two **Types**: 
- **Overlay**
- **Transparent Replacement**

**Overlay** mode takes the material of your mesh and child meshes and gradually changes their color to the one of your choosing. The object then looks like it is pulsing between the original model and its colored version.

**Transparent Replacement** takes all your materials of the model and replaces it with a custom transparent one, pulsing between complete transparency and a **Color** of your choosing. 

![HighlightExample.png](/img/user/img/HighlightExample.png)

**Frequency** is how fast should the pulsing happen.

>Note: Make sure, you have the correct **Highlight Material** assigned in the **Edit** → **Project Settings** → **VR Framework Settings** → **Highlight Material**. It should be already set up by default.