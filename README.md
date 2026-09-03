# 1P1A (One Page One App) & OJapp Dynamic PWA Suite

> Convert a page, directory, or entire site into a standalone Progressive Web App (PWA) with a lightweight client-side script and a dynamically generated Data URL Manifest.

---

## 🌟 Overview

**1P1A (One Page One App)** is a client-side PWA approach that removes the need to create and maintain a static `manifest.json` file for every page or tool.

Add an OJapp script to the page `<head>`, and it dynamically generates a Web App Manifest as a `data:application/manifest+json` URL. Depending on the selected mode, visitors can add an individual page, a directory group, or an entire site to their home screen with its own app name, icon, identity, start URL, and navigation scope.

The core scripts require no build step, user registration, external API, or server-side manifest generation.

---

## 🚀 Key Features

- **Zero Build Step & Zero Backend:** Works on static hosts such as Cloudflare Pages, GitHub Pages, Vercel, and traditional web servers.
- **Dynamic Data URL Manifests:** Generates the Web App Manifest in the browser at runtime.
- **Three App Structures:** Supports page-level (1P1A), directory-level (1G1A), and site-wide (1S1A) apps.
- **Optional Query Handling:** Adds the current query string to `id`, `start_url`, and `scope` when enabled.
- **Custom Metadata:** Configure the app title, icon, identity, start URL, and navigation scope with meta tags.
- **Pure Client-Side Execution:** The Free scripts work without user accounts or external API dependencies.

---

## 💻 Quick Start & App Structures

OJapp reads its meta tags when the script executes. Place all OJapp meta tags **before** the script tag.

### 1. 1P1A: One Page One App

Make the current page—or a query-configured instance of that page—an app on the user's home screen.

```html
<!-- Optional settings must come before the script -->
<meta name="ojapp:query" content="true">
<meta name="ojapp:title" content="My Custom Tool">
<meta name="ojapp:icon" content="/icon.png">

<script src="https://ojapp.app/js/ojapp_1p1a.js"></script>
```

Without optional meta tags, the page URL, page title, and available page icon are used automatically.

### 2. 1S1A: One Site One App

Make the entire origin a single unified app.

```html
<script src="https://ojapp.app/js/ojapp_1s1a.js"></script>
```

By default, `id`, `start_url`, and `scope` use the origin root (`/`).

### 3. 1G1A: One Group One App

Turn a directory such as `/dashboard/`, `/tools/`, or `/docs/` into its own app under the same origin.

```html
<meta name="ojapp:id" content="/dashboard/">
<meta name="ojapp:start-url" content="/dashboard/">
<meta name="ojapp:scope" content="/dashboard/">

<script src="https://ojapp.app/js/ojapp_1s1a.js"></script>
```

Each directory group can use a different ID and scope, allowing multiple group apps under one origin without separate manifest files or build pipelines.

---

## 🔗 Query-Configured Apps

Enable query handling with:

```html
<meta name="ojapp:query" content="true">
```

For example:

```text
/timer/?time=5&mode=down&seconds=on&icon=blue
```

OJapp includes the current query string in the generated Manifest values for:

- `id`
- `start_url`
- `scope`

This allows the URL to store an app's selected state while `id` distinguishes configured instances and `start_url` restores that state when the app launches.

Browsers process Manifest fields according to their own platform implementation. In particular, a browser may normalize or remove the query from the processed `scope`. OJapp still writes the configured query to all three fields and lets the browser perform that normalization.

If your page creates or changes the query after the initial load, navigate to or reload the final query URL before asking the user to add it to the home screen. A History API change alone may not update the URL captured by the iOS **Add to Home Screen** flow.

---

## 🛠️ Metadata Reference

| Meta Tag | Applies To | Description | Default / Fallback |
| :--- | :--- | :--- | :--- |
| `ojapp:title` | 1P1A / 1S1A | Sets the app name | 1P1A: page `<title>`; 1S1A: hostname |
| `ojapp:icon` | 1P1A / 1S1A | Sets the app icon URL | Available page icon, then OJapp default icon |
| `ojapp:query` | 1P1A / 1S1A | Set to `"true"` to include the current query in `id`, `start_url`, and `scope` | Disabled; query removed |
| `ojapp:id` | 1S1A / 1G1A | Sets the Manifest app identity | Origin root |
| `ojapp:start-url` | 1S1A / 1G1A | Sets the URL opened from the home screen | Origin root |
| `ojapp:scope` | 1S1A / 1G1A | Sets the navigation scope | Origin root |
| `ojapp:exclude` | 1P1A / 1S1A | Set to `"true"` to disable OJapp on the page | Disabled |

All custom `id`, `start_url`, and `scope` values must resolve to the same origin as the current page.

---

## 📱 Platform Behavior

### iOS / iPadOS (Safari)

Query-configured home screen entries have been verified on iPhone. Multiple entries created from the same page can retain different launch states, app names, and icons.

The installed icon can also depend on `apple-touch-icon`, so pages that dynamically select an icon should set it before the OJapp script executes.

### Android (Chrome)

OJapp includes the query in the generated `id`, `start_url`, and `scope`. Chrome may normalize the processed navigation scope according to the Web App Manifest specification. Query-based multi-install identity can vary by browser and platform version, so test the intended behavior on the target Android device.

---

## 🧭 Choosing a Mode

| Mode | App Unit | Default Identity / Start / Scope | Typical Use |
| :--- | :--- | :--- | :--- |
| **1P1A** | Current page | Current page path | Tools, products, articles, profiles |
| **1G1A** | Directory group | Explicit directory path | Dashboards, docs, grouped tools |
| **1S1A** | Entire site | Origin root `/` | Conventional site-wide PWA |

---

## 🤝 Community & Feedback

Questions, test results, edge cases, and feature requests are welcome in this repository.

- **Website / Utilities:** [OJapp 1P1A](https://ojapp.app/one-page-one-app/en/)
- **Developer:** OJapp / Ojach
