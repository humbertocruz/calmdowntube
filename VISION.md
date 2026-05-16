# CalmDownTube

## Vision

CalmDownTube is a lightweight Android app built with Expo + React Native.

The app provides a calmer, safer, less overstimulating YouTube experience for children without feeling overly restrictive or “babyish”.

The goal is NOT to compete with YouTube.

The goal is to:

* reduce overstimulation
* remove addictive mechanics
* give parents subtle control
* preserve fun and exploration

The app should feel modern, smooth, minimal, and pleasant.

Think:

* Netflix Kids aesthetic
* calm UI
* simple navigation
* no visual chaos

NOT:

* childish educational app
* overly colorful toy-like interface
* heavy parental control branding

---

# Core Principles

## 1. Calm Experience

The app must reduce:

* autoplay addiction
* hyperstimulation
* chaotic recommendations
* aggressive UI patterns
* loud audio behavior

The experience should feel:

* slower
* safer
* predictable
* relaxing

---

## 2. Children Must Still Enjoy It

The app cannot feel like punishment.

Children should feel:

* freedom
* exploration
* familiarity

The app should resemble a modern streaming app, not a locked educational platform.

---

## 3. Parents Stay in Control

Parents can:

* block videos
* block channels
* approve content
* manage profiles
* control maximum volume

All protected with PIN.

---

# Technical Stack

## Required Stack

* Expo
* React Native
* TypeScript
* Expo Router
* Zustand
* AsyncStorage
* react-native-youtube-iframe

Avoid:

* native Android code
* Kotlin
* Java
* backend initially
* cloud infrastructure initially

Everything should work locally first.

---

# MVP Scope

## MUST HAVE

### Profiles

Children profiles:

* avatar
* emoji
* name
* max volume
* blocked videos
* blocked channels

---

### Parent PIN

PIN required for:

* settings
* switching to parent mode
* blocking/unblocking videos
* approving content

---

### YouTube Player

Use embedded YouTube player.

The player must:

* hide unnecessary controls
* disable playback speed UI
* avoid opening YouTube app
* provide custom controls later

---

### Playlist-Based Navigation

Children browse:

* approved playlists
* approved channels
* categories

Avoid:

* free YouTube homepage
* algorithmic chaos
* Shorts
* comments

---

### Video Blocking

Parents can:

* block current video
* block current channel

Blocked content must never appear again for that profile.

---

### Volume Limiting

Implement internal player max volume.

Example:

* profile max volume = 60%

No need for Android global volume control.

---

# Future Features

## NOT part of MVP

* backend
* sync
* login
* subscriptions
* AI moderation
* analytics
* social features
* ads
* cloud storage

Do not implement these yet.

---

# UI Direction

## Visual Style

Use:

* dark mode
* smooth rounded cards
* minimal UI
* soft contrast
* large thumbnails
* modern typography

Avoid:

* excessive colors
* flashing elements
* toy-like design
* cluttered screens

---

# UX Goals

The app should feel:

* calm
* clean
* safe
* modern
* cozy

Parents should immediately feel:
“This is less chaotic.”

Children should immediately feel:
“This still feels fun.”

---

# Folder Structure

Recommended structure:

```txt
app/
components/
store/
services/
types/
hooks/
constants/
```

---

# Initial Screens

## Home Screen

* profile selection
* clean cards
* dark background

---

## Player Screen

* embedded player
* title
* play/pause
* next video
* block video button

---

## Settings Screen

Protected by PIN.

---

# Important Rules

## DO NOT overengineer.

Keep the app:

* small
* fast
* maintainable

The first goal is:
“working product on a phone”.

NOT:
“perfect architecture”.

---

# Main Product Philosophy

The internet is becoming increasingly optimized for compulsive attention.

Children are especially vulnerable to:

* endless autoplay
* hyperstimulation
* rapid cuts
* loud audio
* chaotic visual content

CalmDownTube exists to create a healthier viewing experience without removing the joy of exploration and entertainment.
