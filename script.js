document.addEventListener("DOMContentLoaded", function() {
    // Ladda header och footer dynamiskt
    const headerElement = document.getElementById("header");
    if (!headerElement) {
        console.error("Header element with id='header' not found in the DOM");
        return;
    }

    fetch("header.html")
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load header: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            headerElement.innerHTML = data;
            console.log("Header loaded successfully");
            // Initiera menyhantering efter att header har laddats
            initializeMenus();
        })
        .catch(error => {
            console.error("Error loading header:", error);
            headerElement.innerHTML = "<p>Kunde inte ladda sidhuvudet. Försök igen senare.</p>";
        });

    fetch("footer.html")
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load footer: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            const footerElement = document.getElementById("footer");
            if (footerElement) {
                footerElement.innerHTML = data;
                console.log("Footer loaded successfully");
            } else {
                console.error("Footer element with id='footer' not found in the DOM");
            }
        })
        .catch(error => {
            console.error("Error loading footer:", error);
            const footerElement = document.getElementById("footer");
            if (footerElement) {
                footerElement.innerHTML = "<p>Kunde inte ladda sidfoten. Försök igen senare.</p>";
            }
        });

    // Funktion för att initiera både dropdowns och hamburgermeny
    function initializeMenus() {
        // Dropdown-hantering för desktop
        const dropdownParents = document.querySelectorAll(".dropdown-parent");
        if (dropdownParents.length === 0) {
            console.warn("No dropdown parents found in the DOM");
        } else {
            dropdownParents.forEach(parent => {
                parent.addEventListener("click", function(event) {
                    if (!event.target.closest(".dropdown a")) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    const dropdown = this.querySelector(".dropdown");
                    const isActive = this.classList.contains("active");

                    // Stäng andra dropdowns
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
                        const topPosition = header.offsetHeight + mainMenu.offsetHeight - 1;
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
        }

        // Hamburgermeny-hantering för mobil
        const hamburgerIcon = document.querySelector(".hamburger-icon");
        const mobileSidebar = document.querySelector(".mobile-sidebar");
        const closeSidebar = document.querySelector(".close-sidebar");
        const sidebarOverlay = document.querySelector(".sidebar-overlay") || document.createElement("div");

        // Skapa overlay om den inte redan finns
        if (!document.querySelector(".sidebar-overlay")) {
            sidebarOverlay.classList.add("sidebar-overlay");
            document.body.appendChild(sidebarOverlay);
        }

        if (hamburgerIcon && mobileSidebar && closeSidebar) {
            hamburgerIcon.addEventListener("click", () => {
                mobileSidebar.classList.add("active");
                sidebarOverlay.classList.add("active");
                console.log("Opened mobile sidebar");
            });

            closeSidebar.addEventListener("click", () => {
                mobileSidebar.classList.remove("active");
                sidebarOverlay.classList.remove("active");
                console.log("Closed mobile sidebar");
            });

            sidebarOverlay.addEventListener("click", () => {
                mobileSidebar.classList.remove("active");
                sidebarOverlay.classList.remove("active");
                console.log("Closed mobile sidebar via overlay");
            });

            // Hantera undermenyer i sidomeny (accordion-stil)
            const sidebarParents = document.querySelectorAll(".sidebar-dropdown-parent");
            if (sidebarParents.length === 0) {
                console.warn("No sidebar dropdown parents found in the DOM");
            } else {
                sidebarParents.forEach(parent => {
                    parent.addEventListener("click", (event) => {
                        if (event.target.tagName !== "A") return; // Endast på föräldralänk
                        parent.classList.toggle("active");
                        console.log("Toggled sidebar dropdown:", parent.textContent);
                    });
                });
            }

            // Markera aktiv sida i sidomeny
            const currentPath = window.location.pathname.split("/").pop() || "index.html";
            const sidebarLinks = document.querySelectorAll(".sidebar-items a");
            sidebarLinks.forEach(link => {
                const href = link.getAttribute("href").split("/").pop();
                if (href === currentPath) {
                    link.parentElement.classList.add("active-page");
                }
            });
        } else {
            console.error("Hamburger menu elements not found:", {
                hamburgerIcon: !!hamburgerIcon,
                mobileSidebar: !!mobileSidebar,
                closeSidebar: !!closeSidebar
            });
        }

        // Markera aktiv sida i huvudmeny
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
            const firstCard = container.querySelector(".small-image-card");
            if (!firstCard) {
                console.warn("No small-image-card found in container");
                return;
            }
            // Hämta kortbredd dynamiskt (inkluderar width + padding, exkluderar marginaler)
            const cardWidth = firstCard.offsetWidth + 20; // Lägg till marginaler (10px vänster + 10px höger)
            const scrollPosition = container.scrollLeft;
            const containerWidth = container.clientWidth;
            const maxScroll = container.scrollWidth - containerWidth;

            let visibleCardIndex = Math.round(scrollPosition / cardWidth);
            visibleCardIndex = Math.max(0, Math.min(visibleCardIndex, dots.length - 1));

            if (scrollPosition >= maxScroll - 10) {
                visibleCardIndex = dots.length - 1;
            }

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === visibleCardIndex);
            });
        });
    }
	
	// Funktion för att beräkna månfas (porterad från http://www.voidware.com/moon_phase.htm)
    function getMoonPhase(year, month, day) {
        var c = e = jd = b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09; // jd är totala dagar sedan JD 0
        jd /= 29.5305882; // dividera med måncykeln
        b = parseInt(jd); // ta heltal
        jd -= b; // fractional del
        b = Math.round(jd * 8); // skala till 0-8
        if (b >= 8) b = 0;
        switch (b) {
            case 0: return 'New Moon';
            case 1: return 'Waxing Crescent Moon';
            case 2: return 'Quarter Moon';
            case 3: return 'Waxing Gibbous Moon';
            case 4: return 'Full Moon';
            case 5: return 'Waning Gibbous Moon';
            case 6: return 'Last Quarter Moon';
            case 7: return 'Waning Crescent Moon';
            default: return 'Error';
        }
    }

    // Poäng för månfas (3=bäst, 0=sämst)
    function getMoonScore(phase) {
        if (phase === 'New Moon' || phase === 'Full Moon') return 3;
        if (phase.includes('Gibbous')) return 2;
        if (phase.includes('Crescent')) return 1;
        if (phase.includes('Quarter')) return 0;
        return 0;
    }

    // Betyg baserat på totalpoäng
    const ratings = ['Sämre', 'Normalt', 'Bra', 'Perfekt'];
    function getRating(total) {
        if (total <= 0) return ratings[0];
        if (total <= 2) return ratings[1];
        if (total <= 4) return ratings[2];
        return ratings[3];
    }

    // Gruppera timdata per dag, skippa förflutna timmar för idag
    function groupByDay(timeSeries) {
        const now = new Date();
        const todayStr = now.toLocaleDateString('sv-SE');
        const days = {};
        timeSeries.forEach(ts => {
            const dt = new Date(ts.validTime);
            const dateStr = dt.toLocaleDateString('sv-SE');
            if (dateStr === todayStr && dt <= now) return; // Skippa förflutna timmar idag
            if (!days[dateStr]) days[dateStr] = {};
            ts.parameters.forEach(p => {
                if (!days[dateStr][p.name]) days[dateStr][p.name] = [];
                days[dateStr][p.name].push(p.values[0]);
            });
        });
        return days;
    }

    // Väderpoäng för en dag (fokus på tryckvariation, + andra faktorer)
    function getWeatherScore(dayData) {
        let score = 0;
        if (dayData.msl && dayData.msl.length > 1) {
            const delta = dayData.msl[dayData.msl.length - 1] - dayData.msl[0];
            if (delta < -6) score += 3; // Starkt fallande tryck: väldigt bra
            else if (delta < -3) score += 2; // Fallande: bra
            else if (delta < 0) score += 1; // Lätt fallande: ok
            else if (delta > 6) score -= 3; // Starkt stigande: dåligt
            else if (delta > 3) score -= 2; // Stigande: dåligt
        }
        // Vind (medelvärde, m/s)
        if (dayData.ws) {
            const windAvg = dayData.ws.reduce((a, b) => a + b, 0) / dayData.ws.length;
            if (windAvg < 3) score += 1; // Lugnt: bra
            else if (windAvg > 8) score -= 2; // Blåsigt: dåligt
        }
        // Molntäcke (medel %, pct=total cloud cover)
        if (dayData.pct) {
            const cloudAvg = dayData.pct.reduce((a, b) => a + b, 0) / dayData.pct.length;
            if (cloudAvg > 60) score += 1; // Mulet: bra för fiske
            else if (cloudAvg < 30) score -= 1; // Klart: sämre
        }
        // Nederbörd (medel mm/h, pmean)
        if (dayData.pmean) {
            const precipAvg = dayData.pmean.reduce((a, b) => a + b, 0) / dayData.pmean.length;
            if (precipAvg > 0 && precipAvg < 1) score += 1; // Lätt regn: bra
            else if (precipAvg > 3) score -= 1; // Kraftigt regn: sämre
        }
        return score;
    }

    // Visa tabell
    function displayPrognos(lat, lon, weatherData) {
        const container = document.getElementById('prognos');
        let table = '<table><tr><th>Datum</th><th>Månfas</th><th>Prognos</th></tr>';
        const today = new Date();
        const weatherDays = weatherData ? groupByDay(weatherData.timeSeries) : null;
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const phase = getMoonPhase(year, month, day);
            const moonScore = getMoonScore(phase);
            let weatherScore = 0;
            const dateStr = date.toLocaleDateString('sv-SE');
            if (weatherDays && weatherDays[dateStr]) {
                weatherScore = getWeatherScore(weatherDays[dateStr]);
            }
            const total = moonScore + weatherScore;
            const rating = getRating(total);
            table += `<tr><td>${dateStr}</td><td>${phase}</td><td>${rating}</td></tr>`;
        }
        table += '</table>';
        container.innerHTML = table;
    }

    // Hämta väder från SMHI
    function fetchWeather(lat, lon) {
        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(2)}/lat/${lat.toFixed(2)}/data.json`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayPrognos(lat, lon, data);
            })
            .catch(error => {
                console.error('Fel vid hämtning av väder:', error);
                displayPrognos(lat, lon, null); // Visa utan väder
            });
    }

    // Hämta GPS och starta
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                fetchWeather(lat, lon);
            },
            error => {
                console.error('Geolocation-fel:', error);
                displayPrognos(null, null, null); // Visa utan plats/väder
            }
        );
    } else {
        displayPrognos(null, null, null);
    }
	
});