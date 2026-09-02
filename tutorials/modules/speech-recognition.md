---
id: speech-recognition
title: 'Speech Recognition'
sidebar_label: 'Speech Recognition'
---

| Dependencies: | none |
| ------------- | ---- |

The Speech Recognition module turns what the trainee says into text, offline and on the headset, so a
step can be finished by saying the right thing.

Add it from the **[Scene Builder](/tutorials/getting-started/scene-builder)** → **Modules** →
**Speech Recognition Module**. It adds the manager with its microphone input already wired in.

> This replaces the 3.0 **Voice React** module. That one could only tell "ano" from "ne", and evaluated
> every recording as one or the other. This one recognises actual sentences and can be told to expect a
> particular one.

## Speech Recognition Manager

One per scene. It owns the microphone, runs the model on a worker thread and reports what it heard.

| Setting | What it is |
| --- | --- |
| **Model Folder** | Where the model lives, relative to StreamingAssets. The project setup copies it there for you |
| **Model Cache Version** | Bump it when the model changes but the app version does not, so the headset copies the new one |
| **End Of Speech Seconds** | How much silence ends a sentence |
| **Hotwords** | Terms the model should favour, each with a boost |

**Hotwords** are how you get domain jargon recognised. A boost around **2 to 3** pulls a rare technical
term out of a sentence the model would otherwise turn into common words; push it much higher and the
model starts hearing that word everywhere.

The manager reports two things: a **partial result** while the trainee is still speaking, and a **final
result** once the sentence ends. Matching that text against something the scene expects is not its job -
that is what a phrase does.

## Speech Phrase

Put a **Speech Phrase** wherever the scene expects a particular sentence.

| Setting | What it is |
| --- | --- |
| **Phrase Name** | What this phrase is, for your own use and for the report |
| **Keywords** | The words that count as having said it. Any one of them matches |
| **Once Only** | Whether it stops listening after it has matched once |

![A Speech Phrase in the inspector](/img/vault/SpeechPhraseExample.png)

**Events**: **On Recognized** when the trainee says it, **On Missed** when they said something else while
this phrase was expected.

A phrase is not listening all the time. You tell it to **Expect** the sentence when the step that wants
it begins, and to **Stop Expecting** when the step is over - so a phrase said in the wrong part of the
scenario does not finish a step nobody has reached yet.

> Give a phrase several keywords rather than one exact sentence. People do not say the phrase you wrote
> down: "otevři ventil", "otevřít ventil" and "otevři to" should all count, and each is one keyword.

## Testing without a headset

The module can take its audio from an **audio clip** instead of a microphone, which is how you test a
phrase in the editor without saying anything out loud. Swap the input on the manager, point it at a
recording, and the rest of the module behaves exactly as it does on the device.
