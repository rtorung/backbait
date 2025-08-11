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

    // Funktion för att beräkna månfas
    function getMoonPhase(year, month, day) {
        let c = e = jd = b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09;
        jd /= 29.5305882;
        b = parseInt(jd);
        jd -= b;
        b = Math.round(jd * 8);
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

    // Poäng för månfas
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

    // Gruppera timdata per dag, filtrera till 06:00–21:00
    function groupByDay(timeSeries, filterHours = false) {
        const now = new Date();
        const todayStr = now.toLocaleDateString('sv-SE');
        const days = {};
        timeSeries.forEach(ts => {
            const dt = new Date(ts.validTime);
            const dateStr = dt.toLocaleDateString('sv-SE');
            const hour = dt.getHours();
            if (filterHours && (hour < 6 || hour > 21)) return;
            if (dateStr === todayStr && dt <= now) return;
            if (!days[dateStr]) days[dateStr] = {};
            ts.parameters.forEach(p => {
                if (!days[dateStr][p.name]) days[dateStr][p.name] = [];
                days[dateStr][p.name].push(p.values[0]);
            });
        });
        return days;
    }

    // Väderpoäng för en dag
    function getWeatherScore(dayData) {
        let score = 0;
        if (dayData.msl && dayData.msl.length > 1) {
            const delta = dayData.msl[dayData.msl.length - 1] - dayData.msl[0];
            if (delta < -6) score += 3;
            else if (delta < -3) score += 2;
            else if (delta < 0) score += 1;
            else if (delta > 6) score -= 3;
            else if (delta > 3) score -= 2;
        }
        if (dayData.ws) {
            const windAvg = dayData.ws.reduce((a, b) => a + b, 0) / dayData.ws.length;
            if (windAvg < 3) score += 1;
            else if (windAvg > 8) score -= 2;
        }
        if (dayData.pct) {
            const cloudAvg = dayData.pct.reduce((a, b) => a + b, 0) / dayData.pct.length;
            if (cloudAvg > 60) score += 1;
            else if (cloudAvg < 30) score -= 1;
        }
        if (dayData.pmean) {
            const precipAvg = dayData.pmean.reduce((a, b) => a + b, 0) / dayData.pmean.length;
            if (precipAvg > 0 && precipAvg < 1) score += 1;
            else if (precipAvg > 3) score -= 1;
        }
        return score;
    }

    // Mappning för SMHI Wsymb2
    const weatherIcons = {
        1: { desc: 'Klart', icon: '☀️' },
        2: { desc: 'Nästan klart', icon: '☀️' },
        3: { desc: 'Varierande molnighet', icon: '⛅' },
        4: { desc: 'Halvklart', icon: '⛅' },
        5: { desc: 'Molnigt', icon: '☁️' },
        6: { desc: 'Mulet', icon: '☁️' },
        7: { desc: 'Dimma', icon: '🌫️' },
        8: { desc: 'Lätta regnskurar', icon: '🌦️' },
        9: { desc: 'Måttliga regnskurar', icon: '🌧️' },
        10: { desc: 'Kraftiga regnskurar', icon: '🌧️' },
        11: { desc: 'Åskskurar', icon: '⛈️' },
        12: { desc: 'Lätta byar av regn och snöblandat', icon: '🌨️' },
        13: { desc: 'Måttliga byar av regn och snöblandat', icon: '🌨️' },
        14: { desc: 'Kraftiga byar av regn och snöblandat', icon: '🌨️' },
        15: { desc: 'Lätta snöbyar', icon: '❄️' },
        16: { desc: 'Måttliga snöbyar', icon: '❄️' },
        17: { desc: 'Kraftiga snöbyar', icon: '❄️' },
        18: { desc: 'Lätt regn', icon: '🌧️' },
        19: { desc: 'Måttligt regn', icon: '🌧️' },
        20: { desc: 'Kraftigt regn', icon: '🌧️' },
        21: { desc: 'Åska', icon: '⛈️' },
        22: { desc: 'Lätt regn och snöblandat', icon: '🌨️' },
        23: { desc: 'Måttligt regn och snöblandat', icon: '🌨️' },
        24: { desc: 'Kraftigt regn och snöblandat', icon: '🌨️' },
        25: { desc: 'Lätt snöfall', icon: '❄️' },
        26: { desc: 'Måttligt snöfall', icon: '❄️' },
        27: { desc: 'Kraftigt snöfall', icon: '❄️' }
    };

    // Hämta aktuell väderdata
    function getCurrentWeather(timeSeries) {
        if (!timeSeries || timeSeries.length === 0) return null;
        const current = timeSeries[0];
        const params = {};
        current.parameters.forEach(p => {
            params[p.name] = p.values[0];
        });
        return params;
    }

    // Hitta mest frekventa värde
    function getMode(arr) {
        if (arr.length === 0) return null;
        const freq = {};
        arr.forEach(val => {
            freq[val] = (freq[val] || 0) + 1;
        });
        let maxFreq = 0;
        let modeVal = null;
        Object.keys(freq).forEach(key => {
            if (freq[key] > maxFreq) {
                maxFreq = freq[key];
                modeVal = key;
            }
        });
        return parseInt(modeVal);
    }

    // Uppdaterad displayCurrentWeather
    async function displayCurrentWeather(lat, lon, weatherData) {
        const container = document.getElementById('current-weather');
        if (!lat || !lon || !weatherData) {
            container.innerHTML = '<p>Ingen aktuell väderdata tillgänglig.</p>';
            return;
        }

        // Hämta platsnamn via Nominatim (stad och land)
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

        const current = getCurrentWeather(weatherData.timeSeries);
        if (!current) {
            container.innerHTML = '<p>Ingen aktuell väderdata tillgänglig.</p>';
            return;
        }

        const symb = current.Wsymb2 || 1;
        const iconData = weatherIcons[symb] || { desc: 'Okänt', icon: '❓' };

        // Beräkna dagens fiskeprognos från väderdatan mellan 06:00 och 21:00
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const phase = getMoonPhase(year, month, day);
        const moonScore = getMoonScore(phase);
        const weatherDays = groupByDay(weatherData.timeSeries, true);
        const todayStr = today.toLocaleDateString('sv-SE');
        let weatherScore = weatherDays[todayStr] ? getWeatherScore(weatherDays[todayStr]) : 0;
        const total = moonScore + weatherScore;
        const rating = getRating(total);

        let html = `
            <div class="weather-card">
                <h2>Aktuellt väder i ${place}</h2>
                <p><span class="icon">${iconData.icon}</span> ${iconData.desc}</p>
                <p>Temperatur: ${current.t} °C</p>
                <p>Vind: ${current.ws} m/s från ${current.wd}°</p>
                <p>Lufttryck: ${current.msl} hPa</p>
                <p>Relativ fuktighet: ${current.r} %</p>
                <p><strong>Fiskeprognos idag: ${rating}</strong></p>
            </div>
        `;
        container.innerHTML = html;
    }

    // Uppdaterad displayMiniWeather
    async function displayMiniWeather(lat, lon, weatherData) {
        const container = document.getElementById('mini-weather-card');
        if (!container || !lat || !lon || !weatherData) return;

        // Hämta platsnamn via Nominatim (stad och land)
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

        const current = getCurrentWeather(weatherData.timeSeries);
        if (!current) return;

        const symb = current.Wsymb2 || 1;
        const iconData = weatherIcons[symb] || { desc: 'Okänt', icon: '❓' };

        // Beräkna dagens fiskeprognos från väderdatan mellan 06:00 och 21:00
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const phase = getMoonPhase(year, month, day);
        const moonScore = getMoonScore(phase);
        const weatherDays = groupByDay(weatherData.timeSeries, true);
        const todayStr = today.toLocaleDateString('sv-SE');
        let weatherScore = weatherDays[todayStr] ? getWeatherScore(weatherDays[todayStr]) : 0;
        const total = moonScore + weatherScore;
        const rating = getRating(total);

        const infoText = `<strong>Aktuellt väder i ${place}:</strong> ${iconData.icon} ${iconData.desc}, <strong>Fiske idag: ${rating}</strong>, Temp: ${current.t} °C, Vind: ${current.ws} m/s, Tryck: ${current.msl} hPa, Fukt: ${current.r} %   `;
        let html = `
            <div class="mini-weather-card">
                <div class="marquee">${infoText}</div>
            </div>
        `;
        container.innerHTML = html;
    }

    // Updated displayPrognos to use Web Worker for the loop
    async function displayPrognos(lat, lon, weatherData) {
        await displayCurrentWeather(lat, lon, weatherData);
        const container = document.getElementById('prognos');
        container.innerHTML = '<p>Laddar prognos...</p>'; // Temporary loading message

        if (window.Worker) {
            const worker = new Worker('prognosWorker.js'); // Path to worker file
            const weatherDays = weatherData ? groupByDay(weatherData.timeSeries, true) : null;
            const dayKeys = weatherDays ? Object.keys(weatherDays).slice(0, 5) : [];

            worker.postMessage({ weatherDays, dayKeys });

            worker.onmessage = function(e) {
                container.innerHTML = e.data; // Receive and insert the table HTML
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
            if (document.getElementById('mini-weather-card')) {
                displayMiniWeather(lat, lon, data);
            }
            return;
        }

        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(2)}/lat/${lat.toFixed(2)}/data.json`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(`${cacheKey}_time`, now);
                displayPrognos(lat, lon, data);
                if (document.getElementById('mini-weather-card')) {
                    displayMiniWeather(lat, lon, data);
                }
            })
            .catch(error => {
                console.error('Fel vid hämtning av väder:', error);
                displayPrognos(lat, lon, null);
            });
    }

    // Visa grundläggande prognos baserat på månfas direkt
    displayPrognos(null, null, null);

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