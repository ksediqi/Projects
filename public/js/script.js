"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const widget = document.querySelector(".ai-widget");
    const fab = document.getElementById("aiFab");
    const chat = document.getElementById("aiChat");
    const closeBtn = document.getElementById("aiClose");
    const form = document.getElementById("aiComposer");
    const input = document.getElementById("aiInput");
    const messages = document.getElementById("aiMessages");
    const typing = document.getElementById("aiTyping");
    const welcome = document.querySelector(".ai-welcome");

    if (!widget || !fab) return;

    function toggleChat() {
        const isOpen = widget.classList.toggle("ai-widget--open");
        chat.setAttribute("aria-hidden", String(!isOpen));
        if (isOpen) input.focus();
    }

    fab.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", toggleChat);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && widget.classList.contains("ai-widget--open")) {
            toggleChat();
        }
    });

    function addBubble(text, sender) {
        if (welcome) welcome.remove();

        const bubble = document.createElement("div");
        bubble.className = `ai-bubble ai-bubble--${sender}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        typing.classList.add("ai-typing--visible");
        typing.setAttribute("aria-hidden", "false");
        messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
        typing.classList.remove("ai-typing--visible");
        typing.setAttribute("aria-hidden", "true");
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addBubble(text, "user");
        input.value = "";

        showTyping();

        const delay = 800 + Math.random() * 700;
        setTimeout(() => {
            hideTyping();
            const responses = [
                "I'm still learning! Can you try asking something else?",
                "Great question — I'll have a better answer soon.",
                "I'm here to help with general questions about the site.",
                "The team is working on expanding my knowledge. Check back soon!",
            ];
            addBubble(responses[Math.floor(Math.random() * responses.length)], "bot");
        }, delay);
    });
});

//Reveal the section of main page

const allSections = document.querySelectorAll('.project-card')

const revealSection = function (entries, observer) {
    const [entry] = entries;
    console.log(entry);
    // if (!entry.isIntersecting) return;
    // entry.target.classList.remove('.project-card-hidden')
}

const observe_cards = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
})

allSections.forEach(projectCard => {
    observe_cards.observe(projectCard)
    projectCard.classList.add('project-card-hidden')
})

// Select the DOM elements
// const moreBtn = document.getElementById('download-btn');
// const moreText = document.getElementById('resume-container');
//
// moreBtn.addEventListener('click', e => {
//     e.preventDefault();
//     if (moreText.classList.contains('hidden')) {
//         moreText.classList.remove('hidden');
//         moreBtn.textContent = 'Hide';
//     } else {
//         moreText.classList.toggle('hidden');
//         moreBtn.textContent = 'Show More';
//     }
// })

;