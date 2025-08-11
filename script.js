// script.js
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
                        if (event.target.tagName !== "A") return;
                        parent.classList.toggle("active");
                        console.log("Toggled sidebar dropdown:", parent.textContent);
                    });
                });
            }

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
            const cardWidth = firstCard.offsetWidth + 20;
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

    // Uppdaterad displayCurrentWeather
    async function displayCurrentWeather(lat, lon, currentData) {
        const container = document.getElementById('current-weather');
        if (!currentData) {
            container.innerHTML = '<p>Ingen aktuell väderdata tillgänglig.</p>';
            return;
        }

        let place = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        let city = '';
        let country = '';
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&countrycodes=se,no,fi`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            city = geoData.address.city || geoData.address.town || geoData.address.village || '';
            country = geoData.address.country || '';
            place = (city ? city + ', ' : '') + country;
        } catch (error) {
            console.error('Fel vid hämtning av plats:', error);
        }

        const html = `
            <div class="weather-card">
                <h2>Aktuellt väder i ${place}</h2>
                <p><span class="icon">${currentData.icon}</span> ${currentData.desc}</p>
                <p>Temperatur: ${currentData.t} °C</p>
                <p>Vind: ${currentData.ws} m/s från ${currentData.wd}°</p>
                <p>Lufttryck: ${currentData.msl} hPa</p>
                <p>Relativ fuktighet: ${currentData.r} %</p>
                <p><strong>Fiskeprognos idag: ${currentData.rating}</strong></p>
            </div>
        `;
        container.innerHTML = html;
    }

    // Uppdaterad displayMiniWeather
    async function displayMiniWeather(lat, lon, miniData) {
        const container = document.getElementById('mini-weather-card');
        if (!container || !miniData) return;

        let place = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        let city = '';
        let country = '';
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&countrycodes=se,no,fi`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            city = geoData.address.city || geoData.address.town || geoData.address.village || '';
            country = geoData.address.country || '';
            place = (city ? city + ', ' : '') + country;
        } catch (error) {
            console.error('Fel vid hämtning av plats för mini-kort:', error);
        }

        const infoText = `<strong>Aktuellt väder i ${place}:</strong> ${miniData.icon} ${miniData.desc}, <strong>Fiske idag: ${miniData.rating}</strong>, Temp: ${miniData.t} °C, Vind: ${miniData.ws} m/s, Tryck: ${miniData.msl} hPa, Fukt: ${miniData.r} %   `;
        const html = `
            <div class="mini-weather-card">
                <div class="marquee">${infoText}</div>
            </div>
        `;
        container.innerHTML = html;
    }

    // Updated displayPrognos to use Web Worker for the loop
    async function displayPrognos(lat, lon, weatherData) {
        const container = document.getElementById('prognos');
        container.innerHTML = '<p>Laddar prognos...</p>'; // Temporary loading message

        if (window.Worker) {
            const worker = new Worker('prognosWorker.js');
            worker.postMessage({ weatherData, lat, lon });

            worker.onmessage = function(e) {
                const { table, currentData, miniData } = e.data;
                container.innerHTML = table || '<p>Ingen prognosdata.</p>';
                if (lat && lon) {
                    displayCurrentWeather(lat, lon, currentData);
                    if (document.getElementById('mini-weather-card')) {
                        displayMiniWeather(lat, lon, miniData);
                    }
                }
                worker.terminate(); // Clean up worker
            };

            worker.onerror = function(error) {
                console.error('Worker error:', error);
                container.innerHTML = '<p>Fel vid laddning av prognos.</p>';
            };
        } else {
            // Fallback to original loop if no Worker support
            let table = '<table><tr><th>Datum</th><th>Prognos</th><th>Väderprognos (endast 5 dagar)</th></tr>';
            const today = new Date();
            const weatherDays = weatherData ? groupByDay(weatherData.timeSeries, true) : null;
            const dayKeys = weatherDays ? Object.keys(weatherDays).slice(0, 5) : [];
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
                let weatherInfo = '';
                if (weatherDays && weatherDays[dateStr] && dayKeys.includes(dateStr)) {
                    const dayData = weatherDays[dateStr];
                    weatherScore = getWeatherScore(dayData);
                    const temps = dayData.t || [];
                    const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 'N/A';
                    const symbs = dayData.Wsymb2 || [];
                    const modeSymb = getMode(symbs) || 1;
                    const iconData = weatherIcons[modeSymb] || { desc: 'Okänt', icon: '❓' };
                    weatherInfo = `Medeltemp: ${avgTemp} °C, Väder: ${iconData.icon} ${iconData.desc}`;
                }
                const total = moonScore + weatherScore;
                const rating = getRating(total);
                table += `<tr><td>${dateStr}</td><td>${rating}</td><td>${weatherInfo}</td></tr>`;
            }
            table += '</table>';
            container.innerHTML = table;

            // Fallback för current och mini (använd original funktioner)
            if (lat && lon && weatherData) {
                // Definiera fallback-funktioner här om behövs (getMoonPhase, etc.), men för att undvika dubblering, antag de är definierade tidigare.
                // För full fallback, kopiera funktionerna hit temporary.
            }
        }
    }

    // Hämta väder från SMHI
    function fetchWeather(lat, lon) {
        const cacheKey = `weather_${lat}_${lon}`;
        const cache = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        const now = Date.now();
        if (cache && cacheTime && now - cacheTime < 3600000) {
            console.log('Using cached weather data');
            const data = JSON.parse(cache);
            displayPrognos(lat, lon, data);
            return;
        }

        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(2)}/lat/${lat.toFixed(2)}/data.json`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(`${cacheKey}_time`, now);
                displayPrognos(lat, lon, data);
            })
            .catch(error => {
                console.error('Fel vid hämtning av väder:', error);
                displayPrognos(lat, lon, null);
            });
    }

    // Hämta GPS och uppdatera om möjligt
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                fetchWeather(lat, lon);
            },
            error => {
                console.error('Geolocation-fel:', error);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    // Lägg till event listener för sökknapp
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('location-search');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            // Klick-effekt
            searchBtn.classList.add('clicked');
            setTimeout(() => {
                searchBtn.classList.remove('clicked');
            }, 200);
            try {
                const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=se,no,fi`;
                const response = await fetch(searchUrl);
                const data = await response.json();
                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    fetchWeather(lat, lon);
                    // Nollställ sökfält
                    searchInput.value = '';
                } else {
                    alert('Plats inte hittad i Sverige, Norge eller Finland.');
                }
            } catch (error) {
                console.error('Fel vid platssök:', error);
                alert('Fel vid sökning.');
            }
        });
    }
});