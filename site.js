/* =====================================================
   LUMEN WEBSITE SCRIPT
   Runs the landing page only. The browser app
   (app.html + sketch.js) does not load this file.
===================================================== */

/* -----------------------------------------------------
   1. LINKS
   Add real URLs here. Leave a value empty ("") and the
   page keeps showing a plain "not added yet" note (or
   hides the link) instead of a broken or made-up URL.
----------------------------------------------------- */

const LUMEN_LINKS = {
    // Public link to "Lumen Setup 2.0.0.exe" (for example a GitHub Releases asset).
    windowsDownload: "https://github.com/Philipe-Pajishvili/Lumen-2.0/releases/download/v2.0.0/Lumen.Setup.2.0.0.exe",

    // Public GitHub repository for Lumen.
    github: "https://github.com/Philipe-Pajishvili/Lumen-2.0",

    // Where visitors send feedback: a form, an issues page, or a mailto: link.
    feedback: "https://docs.google.com/forms/d/e/1FAIpQLSdAOdfKORtrW6Py407e5SIEjUGQwUm3TcIpSAZFhQicp0buGA/viewform?usp=publish-editor"
};

function applyLinks() {

    Object.keys(LUMEN_LINKS).forEach((name) => {

        const url = LUMEN_LINKS[name];

        if (!url) {
            return;
        }

        document
            .querySelectorAll('[data-link="' + name + '"]')
            .forEach((link) => {
                link.setAttribute("href", url);
            });

        document
            .querySelectorAll('[data-link-slot="' + name + '"]')
            .forEach((slot) => {
                slot.hidden = false;
            });

        document
            .querySelectorAll('[data-pending="' + name + '"]')
            .forEach((note) => {
                note.hidden = true;
            });
    });
}

/* -----------------------------------------------------
   2. MOBILE NAVIGATION
----------------------------------------------------- */

function setUpNavigation() {

    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");

    if (!toggle || !nav) {
        return;
    }

    const smallScreen = window.matchMedia("(max-width: 55rem)");

    function setOpen(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            toggle.getAttribute("aria-expanded") === "true"
        ) {
            setOpen(false);
            toggle.focus();
        }
    });

    smallScreen.addEventListener("change", () => setOpen(false));
}

/* Marks the nav link for the section on screen. */

function setUpActiveNav() {

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const links = Array.from(
        document.querySelectorAll('.site-nav a[href^="#"]')
    );

    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                links.forEach((link) => {
                    if (link.getAttribute("href") === "#" + entry.target.id) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        },
        { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    // Clear the marker when the visitor is back at the top or in a section without a nav link.
    const unmarked = document.querySelectorAll("#top, #problem, #mission, #feedback");

    const clearObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    links.forEach((link) => link.removeAttribute("aria-current"));
                }
            });
        },
        { rootMargin: "-40% 0px -55% 0px" }
    );

    unmarked.forEach((section) => clearObserver.observe(section));
}

/* -----------------------------------------------------
   3. BOARD ILLUSTRATION
   Mirrors what the real app does: while no gesture is
   detected the highlight moves on ("Nothing"); when the
   gesture is detected the highlighted button is chosen
   ("Input Detected") and spoken.
----------------------------------------------------- */

function setUpDemo() {

    const demo = document.querySelector("[data-demo]");

    if (!demo) {
        return;
    }

    const screen = demo.querySelector("[data-demo-screen]");
    const cells = Array.from(demo.querySelectorAll("[data-demo-cell]"));
    const caption = demo.querySelector("[data-demo-caption]");
    const captionText = caption.querySelector("span");
    const toggle = demo.querySelector("[data-demo-toggle]");

    const TARGET = 4;        // "Drink"
    const STEP_MS = 950;
    const TICKS = TARGET + 4; // scan to target, select, hold twice

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let tick = TARGET + 1;   // static state: Drink selected
    let timer = null;
    let userPaused = reducedMotion.matches;
    let onScreen = true;

    function render() {

        cells.forEach((cell) => {
            cell.classList.remove("is-scanned", "is-selected");
        });

        if (tick <= TARGET) {
            cells[tick].classList.add("is-scanned");
            screen.textContent = "Nothing";
            caption.setAttribute("data-visible", "false");
            return;
        }

        cells[TARGET].classList.add("is-selected");
        screen.textContent = "Input Detected";
        captionText.textContent = "Spoken: \u201C" + cells[TARGET].textContent + "\u201D";
        caption.setAttribute("data-visible", "true");
    }

    function stop() {
        window.clearInterval(timer);
        timer = null;
    }

    function update() {

        const shouldRun = !userPaused && onScreen && !document.hidden;

        if (shouldRun && timer === null) {
            timer = window.setInterval(() => {
                tick = (tick + 1) % TICKS;
                render();
            }, STEP_MS);
        }

        if (!shouldRun) {
            stop();
        }

        toggle.textContent = userPaused ? "Play animation" : "Pause animation";
    }

    toggle.hidden = false;

    toggle.addEventListener("click", () => {

        userPaused = !userPaused;

        // A paused illustration rests on the finished state, so it always reads clearly.
        if (userPaused) {
            tick = TARGET + 1;
            render();
        } else {
            tick = 0;
            render();
        }

        update();
    });

    reducedMotion.addEventListener("change", () => {

        if (reducedMotion.matches) {
            userPaused = true;
            tick = TARGET + 1;
            render();
            update();
        }
    });

    document.addEventListener("visibilitychange", update);

    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            onScreen = entries[0].isIntersecting;
            update();
        }).observe(demo);
    }

    if (!userPaused) {
        tick = 0;
    }

    render();
    update();
}

/* -----------------------------------------------------
   START
----------------------------------------------------- */

applyLinks();
setUpNavigation();
setUpActiveNav();
setUpDemo();
