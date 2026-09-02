---
id: interaction
title: 'Interaction'
sidebar_label: 'Interaction'
---

| Dependencies: | none |
| ------------- | ---- |

The Interaction module is the rig and everything the trainee does with their hands: reaching, picking
things up, working a mechanism, pressing a button, putting something back where it belongs.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Interaction Module**. It brings the framework's XR rig prefab, a **Player Recenter** and the
**InteractionModule** component, already wired together. There is nothing to configure to get started.

---

## The hands

A hand in 4.0 is three layers on top of each other:

1. **The tracked hand** - the raw pose from the headset's hand tracking. It never collides with
   anything. It is the truth about where the player's real hand is.
2. **The physics hand** - a rigidbody that *chases* the tracked hand with a limited force. It is stopped
   by walls, presses on what it touches, and feels the weight of what it carries.
3. **The visual hand** - the mesh you see, drawn on the physics hand.

![The three layers of a hand](/img/vault/hand-layers.svg)

That middle layer is the whole difference from 3.0. Because the hand you see is the hand physics
actually solved, a hand pushed into a table stops at the table, a heavy crate lags behind an empty one,
and a thrown object leaves with a believable speed.

> The framework is **hand tracking only**. There is no controller path.

Held objects are driven the same way: the object is given a velocity towards where the hand wants it,
so it is stopped by the world instead of passing through it. Nothing is ever parented into the palm.

---

## Making something grabbable

Add **Grabbable Object** to it - from the Scene Builder's **Components** category, or by adding the
component by hand. That gives the object what grabbing needs: a collider, a dynamic rigidbody with
gravity, a disabled [Highlight](/tutorials/additions/highlight), and the **Grabbable** tag and layer.

![GrabbableObjectExample](/img/vault/GrabbableObjectExample.png)

The inspector is in sections.

### Grab Behaviour

**Grab Type** decides how a hand takes it:

- **Distance Pinch** - the thumb and one other finger closing on each other while the object is in
  reach. **Grab Finger** picks which finger, **Pinch Distance** how close they must get.
- **Distance Grab** - the whole hand closing while the object is in reach. **Grab Distance** is how far
  through the closing motion counts as a grab.
- **Physical Grab** - the fingers actually touching the object. You choose which fingers have to be on
  it; when they are, the object is taken and those fingers are locked in place until it is released.

**Permanent Grab** keeps the object in the hand until code releases it or it is snapped into a
[Snap Drop Zone](#snap-drop-zone). **Can Swap Hands** lets the other hand take it straight out of the
one holding it.

### Two Hands

**Allow Two Hands** lets a second hand join an object the first is already holding - no re-grab, either
order, and either hand may leave first. **Requires Two Hands** means one hand is not enough to carry it
at all; **One Handed Strength** is how much of its strength the hold keeps while only one hand is on
something that wants two.

> Two hands is not a mode the object enters. It keeps a list of grips, a second hand appends to it, and
> the object is still written exactly once per physics step - which is why the two hands cannot fight
> each other.

### Held And Thrown

**Hold Settings** and **Throw Settings** tune the physics of carrying and letting go. The defaults are
good for a normal prop; the ones worth knowing are:

| Setting | What it does |
| --- | --- |
| **Turns The Hand** | Whether turning the wrist turns the object. Off for something held loosely, like a torch resting in the palm |
| **Snap** | Where the object is placed the moment it is taken |
| **Suspend Gravity** | Gravity off while held, so the hold does not fight a constant downward bias |
| **Ignore Hand Collision** | Hand and object stop colliding while held |
| **Max Acceleration / Angular** | How hard the hold is allowed to pull. This is the object's apparent strength |
| **Velocity Window** | How much of the recent hand motion a throw is measured over |
| **Linear / Angular Multiplier** | Scales the throw. A ball can be tuned to fly and a crate to drop |

**Break Distance** (in *What Can Be Grabbed*) is how far the hand may be dragged away from the player's
real hand before the object is let go - the escape hatch for an object that has got stuck.

### What Can Be Grabbed

A grabbable is usually one component on a parent whose shape is spread over several children. Leave
**Grab Colliders** empty and every collider under the object counts. Fill it in to say *only these*.

### Fingers

**Close Onto Shape** curls the fingers onto the object when it is picked up, so a hand grabbing an
unposed object still closes around it rather than through it. For a hand shape you actually authored,
use a **Grip Point**.

### Events

**On Grab**, **On Release** and **On Swap Hands**.

> To stop the trainee grabbing something, disable the **Grabbable Object** component. **Never** disable
> the collider - the object then falls through the world.

> The component puts the object on the **Grabbable** tag and layer. Do not change either; the hands
> find what they can reach by that layer.

---

## Grip Points

A **Grip Point** is a place on the object where a hand lands, and what the hand does when it gets there.
It is a child object with the **Grip Point** component, positioned where the hand belongs.

Add as many as the object has sensible places to be held: a drill has a handle and a body, a rifle has a
grip and a foregrip, a valve has two spokes.

![A grip point in the inspector](/img/vault/GripPointExample.png)

**Who May Take It**

- **Allowed Hand** - either hand, or only the left, or only the right.
- **Accepted Types** - which grab types this point answers to. Empty means all of them.
- **Shared** - whether both hands may be on this same point at once.
- **Priority** - which point wins when a hand is between two of them.

**Fingers** - what the fingers do once the hand is there:

- **None** - leave them alone.
- **Auto** - close them onto the object's actual shape.
- **Custom** - the pose you author below.

**Two Hands** - a point's **role**: the hand that positions the object, the one that steadies it, or
either. A rifle's grip is the positioning point and its foregrip the steadying one - that is what stops
a rifle grabbed foregrip-first from being aimed by its foregrip.

**Events** - **On Grab** and **On Release**, for this point specifically.

### Authoring a pose

With the grip point selected, press **Pose The Left Hand** or **Pose The Right Hand**. A ghost hand
appears at the point.

![The pose buttons on a grip point](/img/vault/GripPointPoseExample.png)

Move and rotate the ghost until it holds the object the way you want, and shape the fingers with:

- **Close Onto Object** - curl every finger until it meets the object.
- **Fist** - curl every finger the whole way.
- **Open** - back to the hand as the prefab built it.

![GrabPoseExample](/img/vault/GrabPoseExample.png)

Then press **Keep This Pose** to store it on the point, or **Discard** to keep what was there before.

> Pose the **hand** around the object. Moving the object itself just moves the object in the scene - the
> pose is stored relative to the grip point, not to the world.

> The pose stores the **wrist**, in the grip point's own space. That is why a grip point that moves at
> run time - a lever's handle, say - takes the hand with it, and why the same pose works on a rig whose
> hands are built slightly differently.

---

## Mechanisms

A door, a drawer, a valve, a lever, a bolt, a button: in every one of them the *object* moves and the
hand goes with it. That is a **Grip Constraint**, added to the grip point the trainee holds.

![Anatomy of a grip constraint](/img/vault/mechanism-anatomy.svg)

**Grip Constraint (One Axis)** is the one you will use. It says the object may do exactly one thing:

- **Motion** - **Turn** about an axis (a door, a dial, a valve) or **Slide** along it (a drawer, a bolt).
- **Axis** and **Pivot** - which way, around what. The pivot is a transform in the scene; drag its
  handles to place the hinge or the rail.
- **The Two Ends** - **Start** and **End**, each an **At** value (degrees for a turn, metres for a
  slide) and a **Within** tolerance saying how near counts as having reached that end. Each end has its
  own **On Reached** and **On Left** events - that is where the door-opened sound and the
  latch-released step go.

![A grip constraint in the inspector](/img/vault/GripConstraintExample.png)

**Moves** decides what travels: **The Object** (the whole grabbable - a door, a drawer) or **This Part**
(just this grip point and what hangs off it, relative to the object it sits on - a lever on a fixed
machine).

Several constraints on one grip point **compose**: turn about an axis *and then* slide along it is two
of them - that is a power cell you twist and pull out. Anything no constraint allows is held still, so a
mechanism is a list of what the object *may* do.

> A freedom the whole object has, however it is held, goes on the **Grabbable Object** instead of on a
> grip point. A valve with a spoke on each side is one constraint on the valve, so both spokes turn the
> same one.

### Grip Sequence

A **Grip Sequence** joins several mechanisms into one path: a latch that must be flipped before a handle
turns, a key that goes in and then turns, a pump that must come fully back before it chambers anything.

- **How It Is Worked** - **In Order** or in any order, and whether it **repeats**.
- **Stages** - one per step: the **Mechanism**, the point **At** which that stage counts as done (0 to 1
  along its travel) and a **Within** tolerance.
- **Events** for the sequence as a whole.

Nothing in a sequence moves anything: the constraints move, the hold follows them, and the sequence
watches and decides which one is free at any moment. A stage whose turn has not come is switched off, and
a finished stage is held where it ended.

### Poke buttons

A **Poke Button** is a surface that travels when it is pressed: a button, a key, a pedal, a plunger. The
travel is an ordinary **Grip Constraint (One Axis)**, so a button is authored with the same handles and
limits as a drawer, and pressing it fires that constraint's **End** event while coming back up fires its
**Start** one. **Returns** decides whether it springs back on its own.

The fingertips have their own small physics bodies, so a poke is a real touch rather than a raycast, and
nothing here pushes back on the hand.

For a surface that is only touched rather than pressed, use **Poke Interactable** and its **On Touched**
event.

---

## Snap Drop Zone

A place an object belongs. It takes what it accepts, eases it into its seat and holds it there.

![SnapDropZoneExample](/img/vault/SnapDropZoneExample.png)

- **Mode** - **Normal** keeps the object for good (the grabbable is switched off, so no hand takes it
  back) or **Repick** lets it be picked straight back up.
- **Takes** - **From The Hand**, as soon as it is inside, or only once the hand has **let go** of it
  inside the zone.
- **Accepts** - one particular **Object**, or anything with a given **Tag**.
- **Snapped Transform** - the **Seat** it eases onto, how long that takes, and which of **position**,
  **rotation** and **scale** are matched. Turn **scale** off and a snapped object keeps its own size.
  ![SDZExampleBoxes](/img/vault/SDZExampleBoxes.png)
- **Events** - **On Snap** and **On Unsnap**.

> A drop zone is only a holder: it snaps the object into place and nothing else. What the object then
> *becomes* - scenery, a working part of a machine, the thing that finishes a step - is what you hang off
> **On Snap**.

---

## Triggers

### Trigger Action

Events when a matching object enters or leaves a trigger collider. Repeated entries are held off for a
moment, so an object jittering on the boundary fires once instead of many times.

![TriggerAction](/img/vault/TriggerAction.png)

### Trigger Stay

The object has to *stay* inside for **Time To Complete** - holding a tool against a workpiece, standing
somewhere long enough to count.

![TriggerStayExample](/img/vault/TriggerStayExample.png)

Two modes: **Reset** starts the clock again every time the object leaves, **Save** keeps the time already
served.

> With **Time To Complete** at 4 seconds and mode **Reset**: two seconds in, out, and the trainee owes
> the full four again. With **Save**, they owe the remaining two.

### Toggle Select

Touching it flips between selected and deselected, firing one of two events - a switch the trainee
operates by reaching into it. Matches on the collider's name or tag, with a short cooldown so one reach
counts once.

![ToggleSelectExample](/img/vault/ToggleSelectExample.png)

---

## Related

- [Movement](/tutorials/modules/movement) - teleporting, which is aimed with the same hands.
- [Highlight](/tutorials/additions/highlight) - pointing the trainee at the thing they should touch.
- [Root Position](/tutorials/additions/root-position) - what happens to a held object when tracking is
  lost.
