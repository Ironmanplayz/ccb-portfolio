document.addEventListener("DOMContentLoaded", () => {
    let currentPath = window.location.pathname.split("/").pop();

    if (currentPath === "") {
        currentPath = "index.html";
    }

    document.querySelectorAll("nav > .navigation_main a").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
        }
    });
});