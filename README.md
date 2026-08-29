# 1P1A (One Page One App) & OJapp Dynamic PWA Suite

> Convert any single-page tool, directory, or site into a standalone Progressive Web App (PWA) with a single-line script using dynamic Data URL Manifests.

---

## 🌟 Overview

**1P1A (One Page One App)** is a zero-backend, client-side PWA solution designed to eliminate the complexity of configuring static `manifest.json` files, global PWA scopes, and server-side routing rules. 

By injecting a lightweight script into your page's `<head>`, 1P1A dynamically constructs a custom Web App Manifest on the fly using a `data:application/json...` Data URL. This allows users to add individual pages, tools, or section hubs directly to their mobile home screen with dedicated icons, customized app names, and targeted scopes—without affecting the rest of your domain.

---

## 🚀 Key Features

- **Zero Build Step & Zero Backend:** Works instantly on static hosts like Cloudflare Pages, GitHub Pages, Vercel, and traditional web servers.
- **Dynamic Data URL Manifests:** Generates valid Web App Manifests in real-time on the client side.
- **Granular Scope Management:** Support for page-level, group-level, and site-wide PWA behaviors.
- **Customizable Meta Tags:** Override app titles, start URLs, background colors, display modes, and icons without modifying server files.
- **Pure Client-Side Execution:** Fully functional without user registration or external API dependencies.

---

## 💻 Quick Start & Scope Configurations

Choose the script configuration that fits your application structure:

### 1. 1P1A: One Page One App
*Make a single, specific page a standalone app on the user's home screen.*

```html
<!-- Drop this in your <head> -->
<script src="https://ojapp.app/js/ojapp_1p1a.js"></script>

<!-- Optional: Customize title and icon -->
<meta name="ojapp:title" content="My Custom Tool">
<meta name="ojapp:icon" content="/icon.png">
```
### 2. 1S1A: One Site One AppMake your entire domain act as a single unified PWA.HTML<!-- Drop this in your <head> -->
```html
<script src="https://ojapp.app/js/ojapp_1s1a.js"></script>
```
### 3. 1G1A: One Group One AppGroup a specific directory hub (e.g., /dashboard/, /tools/, /docs/) into an isolated PWA under a single domain.HTML<!-- Configure scope & start URL for the group -->
```html
<meta name="ojapp:id" content="/dashboard/">
<meta name="ojapp:start-url" content="/dashboard/">
<meta name="ojapp:scope" content="/dashboard/">

<!-- Load the OJapp PWA handler -->
<script src="https://ojapp.app/js/ojapp_1s1a.js"></script>
```
With 1G1A, you can run multiple independent apps under a single root domain without setting up separate build pipelines or managing static manifest files for each individual sub-route.

## 🛠️ Metadata Reference

| Meta Tag | Description | Default / Fallback |
| :--- | :--- | :--- |
| `ojapp:title` | Specifies the app title for home screen display | Page `<title>` |
| `ojapp:icon` | URL for the application icon | Site favicon / Default icon |
| `ojapp:scope` | Sets the explicit navigation scope for the PWA | Current page / directory |
| `ojapp:start-url` | Sets the launch URL when opened from home screen | Current location |
| `ojapp:id` | Unique identifier for the Web App Manifest | Dynamic page path |

---

## 🤝 Community & Feedback

If you have questions, edge cases, or feature requests regarding 1P1A, feel free to open an issue or start a thread in this community repository!

- **Website / Utilities:** [OJapp 1P1A](https://ojapp.app/one-page-one-app/en/)
- **Developer:** OJapp / おじゃち
