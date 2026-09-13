Things to




# MovieFlix Project: Video Player & API Guide

This document serves as a reference for handling the integration with third-party, unofficial streaming APIs used in this project. It explains common issues, why they occur, and the steps to resolve them.

---

## Issue: Video Player Fails with "Server IP address could not be found"

You may encounter an error where the video player fails to load a movie and the browser console displays a message similar to:

> `vidsrc.xyz’s server IP address could not be found.`
> `ERR_NAME_NOT_RESOLVED`

### Diagnosis: This is NOT a Code Bug

This error indicates a **DNS resolution failure**. It means your browser asked the internet for the address of `vidsrc.xyz`, and the internet's "phone book" (DNS) had no record of it.

The JavaScript code that builds the URL and opens the player is working correctly. The problem is that the destination URL no longer exists.

### Root Cause: The Unofficial API Lifecycle

The streaming sources used in this project (like `vidsrc`) are **unofficial providers**. They do not hold the licenses for the content they serve. As a result, they are in a constant battle with copyright holders and ISPs.

1.  **Copyright Takedowns (DMCA):** These services are frequently issued takedown notices. When this happens, their domain name is often seized or blocked by internet registrars.
2.  **Domain Rotation:** To survive, these services constantly move to new domain names. When `vidsrc.xyz` is taken down, the owners will immediately switch to a new one like `vidsrc.to`, `vidsrc.me`, etc.
3.  **Server Issues:** These free services can also go offline due to server overload, cost, or other technical problems.

**This is a normal and expected part of using such services.** The fix always involves finding the new, active domain.

---

## How to Fix a Broken Video Player URL

Follow these steps when the video player stops working.

### Step 1: Verify the Domain is Dead

Before changing any code, confirm the URL is the problem.

1.  Open `public/js/movies.js` and find the `playVideo` function.
2.  Copy the base URL from the `url` variable (e.g., `https://vidsrc.to`).
3.  Paste it directly into your browser's address bar.
4.  If the site does not load, the domain is dead. You can proceed to the next step.

### Step 2: Find the New, Active Domain

The developer community is usually quick to find the new domains for these services.

1.  Go to Google, Reddit, or GitHub.
2.  Search for terms like:
    *   `"vidsrc new domain"`
    *   `"vidsrc alternative"`
    *   `"vidsrc.to not working"`
3.  Look for recent posts or comments (within the last few weeks) to find the currently active domain.

### Step 3: Update the Code

Once you have the new domain, update the `playVideo` function in `public/js/movies.js`.

**Example:** If the new domain is `new-domain.com`:

**Change this:**
```javascript
const url = `https://vidsrc.to/embed/${type}/${item.id}`;
```

**To this:**
```javascript
const url = `https://new-domain.com/embed/${type}/${item.id}`;
```

---

## Best Practice for Future Maintenance

To make future updates easier, it's best practice to move the video embed URL to your `CONFIG` object at the top of the file.

### Refactoring Example

1.  **Add the URL to your `CONFIG` object:**

    ```javascript
    // In movies.js
    const CONFIG = {
        API_BASE: "/api/list",
        IMG_BASE: "https://image.tmdb.org/t/p/w500",
        BACKDROP_BASE: "https://image.tmdb.org/t/p/original",
        VIDEO_EMBED_BASE: "https://vidsrc.to/embed", // <-- ADD THIS LINE
        // ... other config
    };
    ```

2.  **Update the `playVideo` function to use this variable:**

    ```javascript
    // In the playVideo function
    const playVideo = (item) => {
        if (!item || !videoIframe || !videoOverlay) return;
        const type = item.type === "tv" ? "tv" : "movie";

        // Use the CONFIG variable instead of a hardcoded string
        const url = `${CONFIG.VIDEO_EMBED_BASE}/${type}/${item.id}`;

        videoIframe.src = url;
        videoOverlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    };
    ```

By doing this, the next time the domain changes, you only need to update it in **one single place** at the top of the file, which is much faster and less error-prone.

### Disclaimer

For any real-world, production application, relying on unofficial streaming sources is not recommended due to their unreliability and potential legal issues. A production app should use official, documented APIs from services like YouTube, Vimeo, or a licensed video provider. This project is for educational and demonstration purposes.

