document.addEventListener("DOMContentLoaded", function() {
    // Ladda header och footer dynamiskt (behålls som i originalet)
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
            initializeMenus(); // Initiera menyer efter att header har laddats
        }).catch(error => console.error("Error loading header:", error));

    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        }).catch(error => console.error("Error loading footer:", error));

    // Behållen funktion för att initiera menyer
    function initializeMenus() {
        const dropdownParents = document.querySelectorAll(".dropdown-parent");
        dropdownParents.forEach(parent => {
            parent.addEventListener("click", function(event) {
                if (!event.target.closest(".dropdown a")) event.preventDefault();
                const isActive = this.classList.toggle("active");
                document.querySelectorAll(".dropdown-parent").forEach(p => {
                    if (p !== this) p.classList.remove("active");
                });
            });
        });
        document.addEventListener("click", function(event) {
            if (!event.target.closest(".dropdown-parent")) {
                document.querySelectorAll(".dropdown-parent").forEach(p => p.classList.remove("active"));
            }
        });
        // ... (resten av din meny-logik, hamburger, etc. behålls)
    }
    
    // Behållen funktion för bildindikatorer
    const container = document.querySelector(".small-image-card-container");
    const dots = document.querySelectorAll(".indicator-dot");
    if (container && dots.length > 0) {
        container.addEventListener("scroll", () => {
            // ... (din befintliga scroll-logik behålls)
        });
    }

    // ---- NY, OPTIMERAD VÄDERLOGIK ----

    const prognosPage = document.getElementById('prognos');
    const miniWeatherCard = document.getElementById('mini-weather-card');

    if (prognosPage) {
        handleFullPrognosPage();
    }
    if (miniWeatherCard) {
        handleMiniWeatherCard();
    }

    function handleFullPrognosPage() {
        const currentWeatherContainer = document.getElementById('current-weather');
        const prognosContainer = document.getElementById('prognos');

        prognosContainer.innerHTML = "<p>För en lokal prognos, vänligen tillåt GPS-position eller sök manuellt.</p>";

        navigator.geolocation.getCurrentPosition(
            pos => {
                startWorkerForForecast(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                prognosContainer.innerHTML = "<p>Kunde inte hämta GPS-position. Vänligen sök efter en plats för att se prognosen.</p>";
            }
        );

        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('location-search');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', async () => {
                const query = searchInput.value.trim();
                if (!query) return;
                searchBtn.classList.add('clicked');
                setTimeout(() => searchBtn.classList.remove('clicked'), 200);

                try {
                    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=se,no,fi`;
                    const response = await fetch(searchUrl);
                    const data = await response.json();
                    if (data.length > 0) {
                        startWorkerForForecast(parseFloat(data[0].lat), parseFloat(data[0].lon));
                        searchInput.value = '';
                    } else {
                        alert('Plats inte hittad i Sverige, Norge eller Finland.');
                    }
                } catch (error) {
                    alert('Fel vid sökning.');
                }
            });
        }

        function startWorkerForForecast(lat, lon) {
            currentWeatherContainer.innerHTML = "";
            prognosContainer.innerHTML = "<p>Position hittad! Laddar prognos i bakgrunden...</p>";
            
            const worker = new Worker('prognosWorker.js');
            worker.postMessage({ type: 'fetchForecast', lat, lon });

            worker.onmessage = function(e) {
                const { type, payload } = e.data;
                switch(type) {
                    case 'currentWeatherUpdate':
                        currentWeatherContainer.innerHTML = payload.html;
                        break;
                    case 'forecastTableUpdate':
                        prognosContainer.innerHTML = payload.html;
                        worker.terminate();
                        break;
                    case 'error':
                        prognosContainer.innerHTML = `<p>${payload.message}</p>`;
                        break;
                }
            };
        }
    }

    function handleMiniWeatherCard() {
        navigator.geolocation.getCurrentPosition(pos => {
            const worker = new Worker('prognosWorker.js');
            worker.postMessage({ type: 'fetchMiniWeather', lat: pos.coords.latitude, lon: pos.coords.longitude });
            
            worker.onmessage = function(e) {
                const { type, payload } = e.data;
                if (type === 'miniWeatherUpdate') {
                    miniWeatherCard.innerHTML = payload.html;
                }
                worker.terminate();
            };
        });
    }
});