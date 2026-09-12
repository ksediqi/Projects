# Auth Popover Bug Fixes

**Files changed:** `views/partials/header.ejs`, `public/js/autho.js`

---

## Bug 1 — Popover API "ancestor" relationship (root cause)

**Symptoms**
- Logging in with correct credentials also opened the Create Account panel.
- Clicking "Create Account" from the login form sometimes closed the login but never showed the signup form. Clicking "Sign In" from the signup form sometimes closed the login instead of showing it.

**Why it happened**

The browser Popover API has an "ancestor" rule: if a button inside popover A uses `popovertarget` to open popover B, the API treats A as an ancestor of B and will never auto-dismiss it. Both popovers silently end up open at the same time.

- The `"Create Account"` button was **inside** `loginPopover` with `popovertarget="signUpPopover"`.  
  Result: clicking it opened `signUpPopover` while `loginPopover` stayed open behind it. After a successful login `loginPopover.hidePopover()` ran, but `signUpPopover` was still open and became visible — hence "logged in but Create Account appears".

- The `"Sign In"` button was **inside** `signUpPopover` with `popovertarget="loginPopover"` (default action = `"toggle"`).  
  Result: `loginPopover` was already open (from the step above), so toggle **hid** it instead of showing it — hence "closes login and doesn't navigate to Sign In".

**Fix — `views/partials/header.ejs`**

Removed `popovertarget` from both cross-form buttons and replaced it with explicit `id` attributes so JS can control the transitions cleanly.

```html
<!-- BEFORE (inside loginPopover) -->
<button type="button" class="btn" popovertarget="signUpPopover">
    Create Account
</button>

<!-- AFTER -->
<button type="button" class="btn" id="openSignUpBtn">
    Create Account
</button>
```

```html
<!-- BEFORE (inside signUpPopover) -->
<button type="button" class="backToLoginBtn auth-link-btn btn" popovertarget="loginPopover">
    Sign In
</button>

<!-- AFTER -->
<button type="button" class="backToLoginBtn auth-link-btn btn" id="backToLoginBtn">
    Sign In
</button>
```

**Fix — `public/js/autho.js`**

Added dedicated click handlers that explicitly hide the current popover first, then show the target — no `popovertarget` involved, so the ancestor relationship never forms.

```js
if (openSignUpBtn) {
    openSignUpBtn.addEventListener("click", () => {
        if (formPopover && typeof formPopover.hidePopover === "function") {
            formPopover.hidePopover();
        }
        if (signUpSection && typeof signUpSection.showPopover === "function") {
            signUpSection.showPopover();
        }
    });
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
        if (signUpSection && typeof signUpSection.hidePopover === "function") {
            signUpSection.hidePopover();
        }
        if (formPopover && typeof formPopover.showPopover === "function") {
            formPopover.showPopover();
            if (userInput) userInput.focus();
        }
    });
}
```

---

## Bug 2 — Wrong ID for the signup section element

**File:** `public/js/autho.js`

**Symptom**  
All JS control of the signup panel was silently dead — `signUpSection` was always `null`.

**Why it happened**  
The JS looked up `getElementById("signUpSection")` but the element's actual ID in the HTML is `"signUpPopover"`. The mismatch meant every method call on `signUpSection` was skipped.

**Fix**

```js
// BEFORE
const signUpSection = document.getElementById("signUpSection");

// AFTER
const signUpSection = document.getElementById("signUpPopover");
```

---

## Bug 3 — `backToLoginBtn` selected by wrong query

**File:** `public/js/autho.js`

**Symptom**  
The "Sign In" button in the signup form had no working JS handler.

**Why it happened**  
The JS used `getElementById("backToLoginBtn")` but the element only had `class="backToLoginBtn"` — no `id` attribute — so the lookup always returned `null`.

**Fix — `views/partials/header.ejs`**  
Added `id="backToLoginBtn"` to the element (the existing class was kept):

```html
<!-- BEFORE -->
<button type="button" class="backToLoginBtn auth-link-btn btn" ...>

<!-- AFTER -->
<button type="button" class="backToLoginBtn auth-link-btn btn" id="backToLoginBtn">
```

The JS selector `getElementById("backToLoginBtn")` now correctly finds the element.

---

## Bug 4 — Duplicate event handlers for `backToLoginBtn`

**File:** `public/js/autho.js`

**Symptom**  
If the selector had ever worked, the click handler would have fired twice per click.

**Why it happened**  
The same `if (backToLoginBtn && signUpSection)` block was copy-pasted twice, registering two separate `addEventListener("click", ...)` calls on the same button.

**Fix**  
Removed both duplicate blocks and replaced them with a single handler each for `openSignUpBtn` and `backToLoginBtn` (see Bug 1 fix above).

---

## Bug 5 — `updateUIFromLoginState()` did not close the signup popover

**File:** `public/js/autho.js`

**Symptom**  
If `signUpPopover` happened to be open at login time (due to Bug 1), it remained visible after login succeeded.

**Why it happened**  
`updateUIFromLoginState()` only called `formPopover.hidePopover()` (login form), with no corresponding close call for the signup form.

**Fix**

```js
// BEFORE
if (loggedIn && formPopover && typeof formPopover.hidePopover === "function") {
    formPopover.hidePopover();
}

// AFTER
if (loggedIn) {
    if (formPopover && typeof formPopover.hidePopover === "function") {
        formPopover.hidePopover();
    }
    if (signUpSection && typeof signUpSection.hidePopover === "function") {
        signUpSection.hidePopover();
    }
}
```

---

## Summary Table

| # | Bug | Root cause | Files changed |
|---|-----|-----------|---------------|
| 1 | Login opens Create Account / Sign In closes login | Popover API ancestor relationship from cross-form `popovertarget` usage | `header.ejs`, `autho.js` |
| 2 | All signup JS was dead | `getElementById("signUpSection")` — ID mismatch | `autho.js` |
| 3 | "Sign In" button in signup had no JS handler | `getElementById("backToLoginBtn")` — element had class, not ID | `header.ejs`, `autho.js` |
| 4 | "Sign In" handler would have fired twice | Same event listener registered in two identical `if` blocks | `autho.js` |
| 5 | Signup panel stayed open after login | `updateUIFromLoginState()` only closed the login popover | `autho.js` |

// Things to fix and implement later.
User should be able to sign up with google or Github account.