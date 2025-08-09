document.addEventListener("DOMContentLoaded", function() {
    // Ladda header och footer dynamiskt
    fetch("header.html")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load header");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;
            console.log("Header loaded successfully");
            // Återinitiera dropdown-hanterare efter att header har laddats
            initializeDropdowns();
        })
        .catch(error => {
            console.error("Error loading header:", error);
            document.getElementById("header").innerHTML = "<p>Kunde inte ladda sidhuvudet. Försök igen senare.</p>";
        });

    fetch("footer.html")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load footer");
            return response.text();
        })
        .then(data => {
            document.getElementById("footer").innerHTML = data;
            console.log("Footer loaded successfully");
        })
        .catch(error => {
            console.error("Error loading footer:", error);
            document.getElementById("footer").innerHTML = "<p>Kunde inte ladda sidfoten. Försök igen senare.</p>";
        });

    // Funktion för att initiera dropdown-hanterare
    function initializeDropdowns() {
        const dropdownParents = document.querySelectorAll(".dropdown-parent");
        if (dropdownParents.length === 0) {
            console.warn("No dropdown parents found");
            return;
        }

        dropdownParents.forEach(parent => {
            parent.addEventListener("click", function(event) {
                // Endast förhindra standardbeteende om klicket är på föräldern, inte på en länk i dropdown
                if (!event.target.closest(".dropdown a")) {
                    event.preventDefault();
                    event.stopPropagation();
                }

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
                    dropdown.style.display = "flex";
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
    }

    // Hantera prickindikatorer för små bildkort i mobil
    const container = document.querySelector(".small-image-card-container");
    const dots = document.querySelectorAll(".indicator-dot");

    if (container && dots.length > 0) {
        container.addEventListener("scroll", () => {
            const cardWidth = 331 + 20; // Kortbredd (331px) + marginal (20px)
            const scrollPosition = container.scrollLeft;
            const containerWidth = container.clientWidth;
            const maxScroll = container.scrollWidth - containerWidth;

            // Beräkna vilket kort som är mest synligt
            let visibleCardIndex = Math.round(scrollPosition / cardWidth);
            visibleCardIndex = Math.max(0, Math.min(visibleCardIndex, dots.length - 1));

            // Särskild hantering för sista kortet
            if (scrollPosition >= maxScroll - 10) {
                visibleCardIndex = dots.length - 1;
            }

            // Uppdatera aktiva pricken
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === visibleCardIndex);
            });
        });
    }
});