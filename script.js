document.addEventListener("DOMContentLoaded", function() {
    // Hantera dropdown-menyer
    const dropdownParents = document.querySelectorAll(".dropdown-parent");

    dropdownParents.forEach(parent => {
        parent.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();

            const dropdown = this.querySelector(".dropdown");
            const isActive = this.classList.contains("active");

            // Stäng alla andra dropdown-menyer
            dropdownParents.forEach(p => {
                if (p !== this) {
                    p.classList.remove("active");
                    const otherDropdown = p.querySelector(".dropdown");
                    if (otherDropdown) {
                        otherDropdown.style.display = "none";
                        console.log("Closed dropdown:", p.textContent);
                    }
                }
            });

            // Växla denna dropdown
            if (!isActive) {
                this.classList.add("active");
                dropdown.style.display = "flex"; // Desktop: flex, Mobil: block (hanteras i CSS)
                const header = document.querySelector(".site-header");
                const mainMenu = document.querySelector(".main-menu");
                const topPosition = header.offsetHeight + mainMenu.offsetHeight;
                dropdown.style.top = `${topPosition}px`;
                console.log("Opened dropdown:", this.textContent, "Top position:", topPosition);
            } else {
                this.classList.remove("active");
                dropdown.style.display = "none";
                console.log("Closed dropdown:", this.textContent);
            }
        });
    });

    // Stäng dropdown vid klick utanför
    document.addEventListener("click", function(event) {
        if (!event.target.closest(".dropdown-parent")) {
            dropdownParents.forEach(parent => {
                parent.classList.remove("active");
                const dropdown = parent.querySelector(".dropdown");
                if (dropdown) {
                    dropdown.style.display = "none";
                    console.log("Click outside dropdown detected, closed:", parent.textContent);
                }
            });
        }
    });

    // Markera aktiv sida
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const menuLinks = document.querySelectorAll(".menu-items a, .dropdown a");
    menuLinks.forEach(link => {
        const href = link.getAttribute("href").split("/").pop();
        if (href === currentPath) {
            link.parentElement.classList.add("active-page");
        }
    });

    // Hantera prickindikatorer för små bildkort i mobil
    const container = document.querySelector(".small-image-card-container");
    const dots = document.querySelectorAll(".indicator-dot");

    if (container && dots.length > 0) {
        container.addEventListener("scroll", () => {
            const cardWidth = 250 + 20; // Kortbredd (250px) + marginal (20px)
            const scrollPosition = container.scrollLeft;
            const containerWidth = container.clientWidth;

            // Beräkna vilket kort som är mest synligt (majoritet i viewport)
            const visibleCardIndex = Math.round((scrollPosition + containerWidth / 2) / cardWidth);

            // Uppdatera aktiva pricken
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === visibleCardIndex);
            });
        });
    }
});