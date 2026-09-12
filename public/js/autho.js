"use strict";

// ============================================================================
// USER DATA & AUTHENTICATION
// ============================================================================

// Dummy user data for demo
const userInfo = {
    Name: "Jamshid",
    email: "js@gmail.com",
    username: "js",
    password: "54321", // string to match input
};

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

// document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "hidden") {
//         navigator.sendBeacon("/api/logout");
//     }
// })

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {


    // ------------------------------------------------------------------------
    // DOM ELEMENT REFERENCES
    // ------------------------------------------------------------------------

    // Header / menu elements
    // Header / menu elements
    // Header / menu elements
    // const navbar = document.querySelector(".main-navbar"); // No longer needed for toggle logic

    const userToggle = document.getElementById("userMenuToggle");
    const dropdown = document.getElementById("userMenuDropdown");
    const logoutBtn = document.getElementById("logoutBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const profileBtn = document.getElementById("profileBtn");
    const loginBtn = document.querySelector(".btn-login");
    const createAccountBtn = document.querySelector(".createAccountBtn");
    // Login popover elements
    const formPopover = document.getElementById("loginPopover");
    const userInput = document.getElementById("userInput");
    const passwordInput = document.getElementById("inputPassword");
    const errorBox = document.getElementById("loginError");

    // Sign-up section elements
    const signUpSection = document.getElementById("signUpPopover");
    const openSignUpBtn = document.getElementById("openSignUpBtn");
    const backToLoginBtn = document.getElementById("backToLoginBtn");

    // Logout overlay elements
    const logoutContainer = document.getElementById("logoutContainer");
    const signInAgainBtn = document.getElementById("signInAgainBtn");
    const closeLogoutBtn = document.getElementById("closeLogoutBtn");

    // Optional content sections (conditional display based on login state)
    const hiddenContent = document.getElementById("hiddenContent");
    const displayContent = document.getElementById("displayContent");

    // ------------------------------------------------------------------------
    // SIGN-UP FORM HANDLER
    // ------------------------------------------------------------------------

    const signupForm = signUpSection ? signUpSection.querySelector("form") : null;
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // TODO: replace this with real signup API later
            alert("Sign up functionality is not implemented yet.");
        });
    }

    // ------------------------------------------------------------------------
    // HELPER FUNCTIONS
    // ------------------------------------------------------------------------

    /**
     * Updates the UI based on the current login state
     */
    function updateUIFromLoginState() {
        const loggedIn = isLoggedIn();

        // Update header button text
        if (loginBtn) {
            loginBtn.textContent = loggedIn ? userInfo.Name : "Login";
        }
        if (createAccountBtn) {
            createAccountBtn.classList.toggle("hidden", loggedIn);
        }

        // Toggle page sections based on the login state (if present)
        if (hiddenContent && displayContent) {
            if (loggedIn) {
                hiddenContent.classList.remove("hidden");
                displayContent.classList.add("hidden");
            } else {
                hiddenContent.classList.add("hidden");
                displayContent.classList.remove("hidden");
            }
        }

        // Always hide dropdown when the state changes
        if (dropdown) {
            dropdown.classList.add("hidden");
        }

        // Close both auth popovers on successful login
        if (loggedIn) {
            if (formPopover && typeof formPopover.hidePopover === "function") {
                formPopover.hidePopover();
            }
            if (signUpSection && typeof signUpSection.hidePopover === "function") {
                signUpSection.hidePopover();
            }
        }
    }

    /**
     * Shows the logout overlay screen
     */

    // Refer to bugAndErrorFixs.md for references.
    /**
     * Shows the logout overlay screen
     */
    function showLogoutScreen() {
        if (logoutContainer) {
            logoutContainer.classList.add("active");
            document.body.classList.add("logout-active");
        }
    }

    /**
     * Hides the logout overlay screen
     */
    function hideLogoutScreen() {
        if (logoutContainer) {
            logoutContainer.classList.remove("active");
            document.body.classList.remove("logout-active");
        }
    }

    /**
     * Hides the login error message
     */
    function hideError() {
        if (errorBox) {
            errorBox.classList.add("hidden");
        }
    }

    // ------------------------------------------------------------------------
    // LOGIN FORM SUBMISSION
    // ------------------------------------------------------------------------

    if (formPopover) {
        formPopover.addEventListener("submit", (event) => {
            event.preventDefault();

            const loginValue = userInput ? userInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value.trim() : "";

            // Check if the input matches either the email OR the username
            const isUserValid =
                loginValue === userInfo.email || loginValue === userInfo.username;
            const isPassValid = password === userInfo.password;


            if (isUserValid && isPassValid) {
                localStorage.setItem("isLoggedIn", "true");

                hideError();
                updateUIFromLoginState();

            } else if (errorBox) {
                errorBox.classList.remove("hidden");
                const text = errorBox.querySelector(".alert-text");
                if (text) {
                    text.textContent = "Invalid email or password. Please try again.";
                }
            }
        });
    }

    // Hide error message when user starts typing
    if (userInput) {
        userInput.addEventListener("input", hideError);
    }
    if (passwordInput) {
        passwordInput.addEventListener("input", hideError);
    }

    // ------------------------------------------------------------------------
    // SIGN UP <-> LOGIN TOGGLE
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
// USER MENU / HEADER INTERACTIONS
// ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // USER MENU / HEADER INTERACTIONS
    // ------------------------------------------------------------------------

    if (userToggle) {
        userToggle.addEventListener("click", (e) => {
            e.stopPropagation();

            if (!isLoggedIn()) {
                // Not logged in -> open login popover
                if (formPopover && typeof formPopover.showPopover === "function") {
                    formPopover.showPopover();
                    if (userInput) {
                        userInput.focus();
                    }
                }
                return;
            }

            // Toggle dropdown menu if logged in
            if (dropdown) {
                dropdown.classList.toggle("hidden");
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdown) return;

        // Check if click is outside the user-menu area
        if (!e.target.closest(".user-menu")) {
            if (!dropdown.classList.contains("hidden")) {
                dropdown.classList.add("hidden");
            }
        }
    });

    // Close dropdown & log out overlay on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (dropdown) {
                dropdown.classList.add("hidden");
            }
            hideLogoutScreen();
        }
    });

    // ------------------------------------------------------------------------
    // LOGOUT / PROFILE / SETTINGS ACTIONS
    // ------------------------------------------------------------------------

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            updateUIFromLoginState();

            // Redirect to the main page with a flag to show the "logged out" card
            window.location.href = "/?loggedOut=1";
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            alert("Settings page coming soon...");
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            alert("Profile page coming soon...");
        });
    }

    // ------------------------------------------------------------------------
    // LOGOUT OVERLAY CONTROLS
    // ------------------------------------------------------------------------

    // Show overlay when redirected with ?loggedOut=1
    // ------------------------------------------------------------------------
    // LOGOUT OVERLAY CONTROLS
    // ------------------------------------------------------------------------

    // Show overlay only when redirected with ?loggedOut=1 and the user is not logged in
    const params = new URLSearchParams(window.location.search);
    if (params.get("loggedOut") === "1" && logoutContainer) {
        if (isLoggedIn()) {
            hideLogoutScreen();

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        } else {
            showLogoutScreen();
        }
    }

    if (signInAgainBtn) {
        signInAgainBtn.addEventListener("click", () => {
            hideLogoutScreen();

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            if (formPopover) {
                if (typeof formPopover.showPopover === "function") {
                    formPopover.showPopover();
                } else {
                    formPopover.classList.add("open");
                }
                if (userInput) {
                    userInput.focus();
                }
            }
        });
    }

    if (closeLogoutBtn) {
        closeLogoutBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            hideLogoutScreen();

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        });
    }

    if (logoutContainer) {
        logoutContainer.addEventListener("click", (e) => {
            // Close overlay when clicking on the background
            if (e.target === logoutContainer) {
                hideLogoutScreen();
            }
        });
    }


    // ------------------------------------------------------------------------
    // INITIAL SYNC
    // ------------------------------------------------------------------------

    updateUIFromLoginState();
});
