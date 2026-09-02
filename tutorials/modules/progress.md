---
id: progress
title: 'Progress'
sidebar_label: 'Progress'
---

| Dependencies: | [Audio](/tutorials/modules/audio), [Localization](/tutorials/modules/localization) (for spoken instructions) |
| ------------- | --------------------------------------- |

Most training apps walk the trainee through a process: do this, then that, and if this went wrong, do
something else. That process is the **Progress module**.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Progress Manager**. It creates the manager and an empty **Scenario** under the **SCENARIO** marker,
ready to author.

---

## The pieces

- A **Scenario** holds the whole process. One per scene.
- A **Progress Block** is a group of steps and the unit of routing - you enter a block at its first step.
- A **Progress Step** is one thing the trainee has to do, with the events and audio around it.

![ProcessExample](/img/vault/ProcessExample.png)

A block has **one way in** and as many ways out as you like: any step may route onwards. An app can have
several **End** steps but only one **Start**.

## Progress Manager

![ProgressManagerExample](/img/vault/ProgressManagerExample.png)

- **Start Block** - where the process begins.
- **End Sound Key** - the sound played when the process finishes, by localisation key.
- **Step Queue** - not a setting but a live view of what is pending, which is worth watching in Play mode.

The manager can be started and stopped from events, and it says when the process has finished.

---

## Authoring the process

Open **VRFramework** → **Progress Graph Editor**.

**Right click** in the grid → **Create new block**. Rename it, and add steps with the **+** button.

Drag from a step's output port onto another block's input port to connect them. You are asked whether
this is a plain route or a conditional branch.

![ProgressGraphExample](/img/vault/ProgressGraphExample.png)

- The **cyan** route is constant - when that step completes, that block is queued.
- **Green** and **red** are the two sides of a conditional branch: green for true, red for false.
- The **green** block is the one the process starts in; the **magenta** ones end it.

Assign the block the process starts with to the manager's **Start Block**.

Everything you draw exists in the scene: a child object per block under **Scenario**, and a child object
per step under each block. Both are numbered for you - `[02]` is the second block, `[01-02]` the second
step of the first.

![The scenario in the hierarchy](/img/vault/Steps.png)

Blocks carry nothing but their name - they are a logical divider and a routing target. The steps carry
the work.

---

## A step

![ProgressStepExample](/img/vault/ProgressStepExample.png)

**Step**

| Setting | What it does |
| --- | --- |
| **Step Name** | What this step is. It renames the object in the hierarchy too, keeping its `[block-step]` number |
| **Instruction Key** | The audio played when the step starts, by localisation key - usually the instruction |

**Completion**

| Setting | What it does |
| --- | --- |
| **Play Success** | Whether completing the step plays the success sound |
| **Delay To Next** | How long to wait before the next step begins |
| **Is Complete** | Read-only in Play mode: whether this step is done |

**Events**

| Event | When it fires |
| --- | --- |
| **Before** | The moment the step becomes active |
| **After Audio** | When the instruction audio has finished - or straight after **Before**, when the step has no instruction |
| **After Complete** | When the step is completed |

> A step's object is **active in the hierarchy while the step is active** and deactivated when it
> completes. Put objects that belong to one step under that step; put objects that live across several
> steps somewhere else.

---

## The step queue

![How the step queue works](/img/vault/step-queue.svg)

The whole process runs on one **queue**. Starting a block puts all of its steps into the queue, and the
manager always makes the first step in the queue the active one. First in, first out - like the queue at
a doctor's.

That is why the routing components look the way they do.

### Constant Enqueue

![ConstantEnqueueExample](/img/vault/ConstantEnqueueExample.png)

On a step with a blue route out of it.

- **Block To Enqueue** - the block this route leads to.
- **Delete Step Queue** - clear what is pending before queueing it. Use it when the new block replaces
  the rest of the process rather than following it.
- **Queue Location** - **End** to queue behind what is already waiting, or **Start** to jump the queue.

### Conditional Enqueue

![ConditionalEnqueueExample](/img/vault/ConditionalEnqueueExample.png)

On a step with a green and red route. It holds a set of **flags** that the scene ticks off through
events, and queues one block if the verdict is true and another if it is false - each with its own queue
location and its own *delete queue* switch.

How the flags combine is the **mode**:

- **All** - every flag has to be true.
- **At Least** - at least **Required Count** of them. Set it to 1 for an "any of" check.

The scene sets a flag with **SetBoolTrue(index)** / **SetBoolFalse(index)** from any UnityEvent - a
trigger, a snap zone, a grabbable, a speech phrase.

### Conditional Event

The same flags and the same verdict, but instead of queueing a block it just raises one of two events.
Use it when the branch does not change the route, only what happens.
