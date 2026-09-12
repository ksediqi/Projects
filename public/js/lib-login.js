"use strict";

// ============================================================================
// LIBRARY LOGIN / SIGN-UP / READ-GATING / SUBSCRIBE
//
// Drives the #libLoginModal (see partials/lib-auth-modal.ejs) plus the
// library nav's own login button, the per-book "Read" buttons and the
// pricing CTAs on the /projects/library page.
//
// Auth state is shared with the rest of the site via the same
// localStorage("isLoggedIn") flag that /js/autho.js uses, so signing in
// here also signs you in on every other page (and vice versa). This file
// is loaded site-wide (see partials/head.ejs) but no-ops immediately on
// any page that doesn't have the library login form in the DOM.
//
// NOTE: this relies on `isLoggedIn()` and `userInfo` being defined by
// /js/autho.js, which is loaded as a plain (non-module) script alongside
// this one — classic <script> tags in the same document share one global
// scope, so those top-level declarations are visible here by the time
// DOMContentLoaded fires, even though autho.js is loaded after us.
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("js-login-form");
    if (!form) return; // Not on a page with the library login modal — nothing to do.

    // ------------------------------------------------------------------------
    // DOM REFERENCES
    // ------------------------------------------------------------------------
    const modal = document.getElementById("libLoginModal");
    const alertEl = document.getElementById("js-alert");

    const loginView = document.getElementById("libLoginView");
    const signupView = document.getElementById("libSignupView");
    const openSignupBtn = document.getElementById("js-open-signup");
    const openLoginBtn = document.getElementById("js-open-login");

    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const submitBtn = document.getElementById("js-submit-btn");
    const btnLabel = document.getElementById("btn-label");
    const spinner = document.getElementById("js-spinner");
    const togglePwBtn = document.getElementById("js-toggle-pw");
    const iconEye = document.getElementById("icon-eye");
    const iconEyeOff = document.getElementById("icon-eye-off");
    const forgotLink = document.getElementById("js-forgot-link");

    const signupForm = document.getElementById("js-signup-form");
    const signupName = document.getElementById("signupName");
    const signupEmail = document.getElementById("signupEmail");
    const signupUsername = document.getElementById("signupUsername");
    const signupPassword = document.getElementById("signupPassword");
    const signupConfirmPassword = document.getElementById("signupConfirmPassword");
    const signupSubmitBtn = document.getElementById("js-signup-submit-btn");
    const signupBtnLabel = document.getElementById("signup-btn-label");
    const signupSpinner = document.getElementById("js-signup-spinner");

    const libLoginBtn = document.getElementById("libLoginBtn");
    const libUserMenu = document.getElementById("libUserMenu");
    const libUserMenuDropdown = document.getElementById("libUserMenuDropdown");
    const libPlanBadge = document.getElementById("libPlanBadge");
    const libLogoutBtn = document.getElementById("libLogoutBtn");

    const toastEl = document.getElementById("libToast");

    // Holds an action to resume once the user finishes signing in (e.g. the
    // "Read" click or "Upgrade to Pro" click that triggered the login modal).
    let pendingAction = null;
    let toastTimer = null;

    // ------------------------------------------------------------------------
    // SHARED AUTH STATE
    // ------------------------------------------------------------------------
    function loggedIn() {
        return typeof isLoggedIn === "function"
            ? isLoggedIn()
            : localStorage.getItem("isLoggedIn") === "true";
    }

    function getRegisteredAccount() {
        try {
            return JSON.parse(localStorage.getItem("libDemoAccount") || "null");
        } catch {
            return null;
        }
    }

    // Checks the entered credentials against the shared site-wide demo
    // account (js/js@gmail.com) and against whatever was created via the
    // sign-up form in this browser.
    function checkCredentials(identifier, password) {
        const id = identifier.trim().toLowerCase();

        if (typeof userInfo !== "undefined" && userInfo) {
            const matchesBuiltIn =
                (id === userInfo.email.toLowerCase() || id === userInfo.username.toLowerCase()) &&
                password === userInfo.password;
            if (matchesBuiltIn) {
                return {name: userInfo.Name, username: userInfo.username};
            }
        }

        const registered = getRegisteredAccount();
        if (registered) {
            const matchesRegistered =
                (id === registered.email.toLowerCase() || id === registered.username.toLowerCase()) &&
                password === registered.password;
            if (matchesRegistered) {
                return {name: registered.name, username: registered.username};
            }
        }

        return null;
    }

    function completeLogin({name, username}) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("libUserName", name || username || "Reader");
        updateLibNavUI();
    }

    // ------------------------------------------------------------------------
    // TOAST
    // ------------------------------------------------------------------------
    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
    }

    // ------------------------------------------------------------------------
    // MODAL OPEN / CLOSE / VIEW SWITCHING
    // ------------------------------------------------------------------------
    function openModal(view) {
        if (view === "signup") {
            showSignupView();
        } else {
            showLoginView();
        }
        if (modal && typeof modal.showPopover === "function") {
            modal.showPopover();
        }
        if (view !== "signup" && usernameEl) usernameEl.focus();
    }

    function closeModal() {
        if (modal && typeof modal.hidePopover === "function") {
            modal.hidePopover();
        }
    }

    function showLoginView() {
        hideAlert();
        loginView?.classList.remove("hidden");
        signupView?.classList.add("hidden");
    }

    function showSignupView() {
        hideAlert();
        signupView?.classList.remove("hidden");
        loginView?.classList.add("hidden");
        signupName?.focus();
    }

    openSignupBtn?.addEventListener("click", () => showSignupView());
    openLoginBtn?.addEventListener("click", () => showLoginView());

    // ------------------------------------------------------------------------
    // GATED ACTIONS (Read a book / subscribe / anything requiring login)
    // ------------------------------------------------------------------------
    function requireLibAuth(action, {message} = {}) {
        if (loggedIn()) {
            action();
            return;
        }
        pendingAction = action;
        openModal("login");
        if (message) showAlert(message, "info");
    }

    // ------------------------------------------------------------------------
    // ALERT / FIELD ERROR HELPERS
    // ------------------------------------------------------------------------
    function showAlert(message, type /* 'error' | 'success' | 'info' */) {
        if (!alertEl) return;
        alertEl.textContent = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.style.display = "block";
    }

    function hideAlert() {
        if (!alertEl) return;
        alertEl.style.display = "none";
        alertEl.className = "alert";
    }

    function showFieldError(inputEl, errorId) {
        inputEl?.classList.add("is-error");
        const el = document.getElementById(errorId);
        if (el) el.style.display = "block";
    }

    function clearFieldError(inputEl, errorId) {
        inputEl?.classList.remove("is-error");
        const el = document.getElementById(errorId);
        if (el) el.style.display = "none";
    }

    // ------------------------------------------------------------------------
    // LOGIN FORM
    // ------------------------------------------------------------------------
    usernameEl?.addEventListener("input", () => clearFieldError(usernameEl, "username-error"));
    passwordEl?.addEventListener("input", () => clearFieldError(passwordEl, "password-error"));

    togglePwBtn?.addEventListener("click", () => {
        const isHidden = passwordEl.type === "password";
        passwordEl.type = isHidden ? "text" : "password";
        if (iconEye) iconEye.style.display = isHidden ? "none" : "block";
        if (iconEyeOff) iconEyeOff.style.display = isHidden ? "block" : "none";
        togglePwBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });

    forgotLink?.addEventListener("click", (e) => {
        e.preventDefault();
        alert("A password-reset link will be sent to the email on file for your account.");
    });

    function setLoginLoading(isLoading) {
        if (submitBtn) submitBtn.disabled = isLoading;
        if (btnLabel) btnLabel.textContent = isLoading ? "Signing in…" : "Sign In";
        if (spinner) spinner.style.display = isLoading ? "block" : "none";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        let valid = true;
        if (!usernameEl.value.trim()) {
            showFieldError(usernameEl, "username-error");
            valid = false;
        }
        if (!passwordEl.value) {
            showFieldError(passwordEl, "password-error");
            valid = false;
        }
        if (!valid) return;

        setLoginLoading(true);
        // Small delay so the loading state is perceptible — this is a
        // client-only demo, there's no real network round trip.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const account = checkCredentials(usernameEl.value, passwordEl.value);

        if (!account) {
            setLoginLoading(false);
            showAlert("Incorrect library card number or password. Please try again.", "error");
            return;
        }

        completeLogin(account);
        showAlert(`Welcome back, ${account.name}!`, "success");
        setLoginLoading(false);

        setTimeout(() => {
            closeModal();
            form.reset();
            showToast(`Signed in as ${account.name}.`);
            resumePendingAction();
        }, 500);
    });

    // ------------------------------------------------------------------------
    // SIGN-UP FORM (client-only demo account, kept in localStorage)
    // ------------------------------------------------------------------------
    [signupName, signupEmail, signupUsername, signupPassword, signupConfirmPassword].forEach((el) => {
        el?.addEventListener("input", () => clearFieldError(el, `${el.id}-error`));
    });

    function setSignupLoading(isLoading) {
        if (signupSubmitBtn) signupSubmitBtn.disabled = isLoading;
        if (signupBtnLabel) signupBtnLabel.textContent = isLoading ? "Creating account…" : "Create Account";
        if (signupSpinner) signupSpinner.style.display = isLoading ? "block" : "none";
    }

    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        let valid = true;
        if (!signupName.value.trim()) {
            showFieldError(signupName, "signupName-error");
            valid = false;
        }
        if (!/^\S+@\S+\.\S+$/.test(signupEmail.value.trim())) {
            showFieldError(signupEmail, "signupEmail-error");
            valid = false;
        }
        if (!signupUsername.value.trim()) {
            showFieldError(signupUsername, "signupUsername-error");
            valid = false;
        }
        if (signupPassword.value.length < 8) {
            showFieldError(signupPassword, "signupPassword-error");
            valid = false;
        }
        if (signupConfirmPassword.value !== signupPassword.value || !signupConfirmPassword.value) {
            showFieldError(signupConfirmPassword, "signupConfirmPassword-error");
            valid = false;
        }
        if (!valid) return;

        setSignupLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const account = {
            name: signupName.value.trim(),
            email: signupEmail.value.trim(),
            username: signupUsername.value.trim(),
            password: signupPassword.value,
        };
        localStorage.setItem("libDemoAccount", JSON.stringify(account));
        localStorage.setItem("libraryPlan", "free");

        completeLogin(account);
        showAlert(`Welcome to Libraex, ${account.name}!`, "success");
        setSignupLoading(false);

        setTimeout(() => {
            closeModal();
            signupForm.reset();
            showToast(`Account created — you're on the Free plan.`);
            resumePendingAction();
        }, 500);
    });

    function resumePendingAction() {
        if (!pendingAction) return;
        const action = pendingAction;
        pendingAction = null;
        action();
    }

    // ------------------------------------------------------------------------
    // NAV BUTTON + DROPDOWN
    // ------------------------------------------------------------------------
    function planLabel(plan) {
        return plan === "pro" ? "Pro" : "Free";
    }

    function updateLibNavUI() {
        const signedIn = loggedIn();
        const name = localStorage.getItem("libUserName") || "Reader";
        const plan = localStorage.getItem("libraryPlan");

        if (libLoginBtn) libLoginBtn.textContent = signedIn ? name : "Login";
        libUserMenuDropdown?.classList.add("hidden");
        if (libPlanBadge) libPlanBadge.textContent = signedIn && plan ? `Plan: ${planLabel(plan)}` : "";

        updatePricingUI();
    }

    function updatePricingUI() {
        const plan = localStorage.getItem("libraryPlan");
        document.querySelectorAll(".price-cta[data-plan]").forEach((btn) => {
            const isCurrent = loggedIn() && plan === btn.dataset.plan;
            btn.classList.toggle("is-current-plan", isCurrent);
            btn.disabled = isCurrent;
            btn.textContent = isCurrent ? "Current Plan" : btn.dataset.defaultLabel || btn.textContent;
        });
    }

    libLoginBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!loggedIn()) {
            openModal("login");
            return;
        }
        libUserMenuDropdown?.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!libUserMenuDropdown || libUserMenuDropdown.classList.contains("hidden")) return;
        if (!e.target.closest("#libUserMenu")) {
            libUserMenuDropdown.classList.add("hidden");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") libUserMenuDropdown?.classList.add("hidden");
    });

    libLogoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        updateLibNavUI();
        showToast("You've been signed out.");
    });

    // ------------------------------------------------------------------------
    // READ-A-BOOK GATING
    // ------------------------------------------------------------------------
    document.querySelectorAll(".book-read-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const card = btn.closest("[data-book-title]");
            const title = card?.dataset.bookTitle || "this book";
            const url = card?.dataset.bookUrl;

            requireLibAuth(
                () => {
                    if (url) {
                        window.open(url, "_blank", "noopener");
                        showToast(`Opening "${title}"…`);
                    } else {
                        showToast(`No preview is available for "${title}" yet.`);
                    }
                },
                {message: `Sign in to start reading "${title}".`}
            );
        });
    });

    // ------------------------------------------------------------------------
    // SUBSCRIBE / PLAN GATING
    // ------------------------------------------------------------------------
    document.querySelectorAll(".price-cta[data-plan]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const plan = btn.dataset.plan;
            const currentPlan = localStorage.getItem("libraryPlan");
            if (loggedIn() && currentPlan === plan) return; // already on this plan

            requireLibAuth(() => subscribeToPlan(plan), {
                message: `Sign in to subscribe to the ${planLabel(plan)} plan.`,
            });
        });
    });

    function subscribeToPlan(plan) {
        localStorage.setItem("libraryPlan", plan);
        updateLibNavUI();
        showToast(`You're now on the ${planLabel(plan)} plan.`);
    }

    // ------------------------------------------------------------------------
    // INITIAL SYNC
    // ------------------------------------------------------------------------
    updateLibNavUI();
});
