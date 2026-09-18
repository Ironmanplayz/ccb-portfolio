document.addEventListener("DOMContentLoaded", () => {
    let currentPath = window.location.pathname.split("/").pop();

    if (currentPath === "") {
        currentPath = "index.html";
    }

    document.querySelectorAll("nav > .navigation_main a").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(item => item.classList.add("revealed"));
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px"
        });

        revealItems.forEach(item => observer.observe(item));
    }

    document.querySelectorAll(".project_card").forEach(project => {
        const media = project.querySelector(".project_media");
        const slides = project.querySelectorAll(".project_slide");
        const previous = project.querySelector(".project_previous");
        const next = project.querySelector(".project_next");
        const counter = project.querySelector(".project_counter");
        const caption = project.querySelector(".project_caption");
        const controls = project.querySelector(".project_controls");
        let currentSlide = 0;
        let touchStartX = 0;

        if (slides.length === 0 || !media || !controls) {
            return;
        }

        const showSlide = index => {
            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");

                if (!active) {
                    const video = slide.querySelector("video");
                    if (video) {
                        video.pause();
                    }
                }
            });

            currentSlide = index;
            if (counter) {
                counter.textContent = `${currentSlide + 1} / ${slides.length}`;
            }
            if (caption) {
                caption.textContent = slides[currentSlide].dataset.caption || "Project media";
            }
        };

        if (slides.length === 1) {
            controls.classList.add("single_slide");
        }

        if (previous) {
            previous.addEventListener("click", () => {
                showSlide((currentSlide - 1 + slides.length) % slides.length);
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                showSlide((currentSlide + 1) % slides.length);
            });
        }

        media.addEventListener("keydown", event => {
            if (event.target.closest("button, video")) {
                return;
            }
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showSlide((currentSlide - 1 + slides.length) % slides.length);
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                showSlide((currentSlide + 1) % slides.length);
            }
            if (event.key === "Home") {
                event.preventDefault();
                showSlide(0);
            }
            if (event.key === "End") {
                event.preventDefault();
                showSlide(slides.length - 1);
            }
        });

        media.addEventListener("touchstart", event => {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        media.addEventListener("touchend", event => {
            if (event.target.closest("video")) {
                return;
            }
            const touchDistance = event.changedTouches[0].screenX - touchStartX;
            if (Math.abs(touchDistance) < 50 || slides.length === 1) {
                return;
            }
            if (touchDistance < 0) {
                showSlide((currentSlide + 1) % slides.length);
            } else {
                showSlide((currentSlide - 1 + slides.length) % slides.length);
            }
        }, { passive: true });

        showSlide(0);
    });

    const contactForm = document.querySelector(".formContact");

    if (contactForm) {
        const submitButton = contactForm.querySelector(".formSubmit");
        const submitText = submitButton ? submitButton.querySelector("span") : null;
        const status = contactForm.querySelector(".form_status");

        contactForm.addEventListener("submit", async event => {
            event.preventDefault();

            if (submitButton) {
                submitButton.disabled = true;
            }
            if (submitText) {
                submitText.textContent = "Sending...";
            }
            if (status) {
                status.className = "form_status sending";
                status.textContent = "Sending your message...";
            }

            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData);

            try {
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(formObject)
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Message could not be sent.");
                }

                contactForm.reset();
                if (status) {
                    status.className = "form_status success";
                    status.textContent = "Message sent successfully. Thanks for reaching out!";
                }
            } catch (error) {
                if (status) {
                    status.className = "form_status error";
                    status.textContent = "I couldn't send that message right now. Please try again or contact me through LinkedIn.";
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                if (submitText) {
                    submitText.textContent = "Send Message";
                }
            }
        });
    }
});