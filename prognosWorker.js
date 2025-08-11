// --- ALLA HJÄLPFUNKTIONER OCH DATA ÄR NU I WORKERN ---

const weatherIcons = {
    1: { desc: 'Klart', icon: '☀️' }, 2: { desc: 'Nästan klart', icon: '☀️' },
    3: { desc: 'Varierande molnighet', icon: '⛅' }, 4: { desc: 'Halvklart', icon: '⛅' },
    5: { desc: 'Molnigt', icon: '☁️' }, 6: { desc: 'Mulet', icon: '☁️' },
    7: { desc: 'Dimma', icon: '🌫️' }, 8: { desc: 'Lätta regnskurar', icon: '🌦️' },
    9: { desc: 'Måttliga regnskurar', icon: '🌧️' }, 10: { desc: 'Kraftiga regnskurar', icon: '🌧️' },
    11: { desc: 'Åskskurar', icon: '⛈️' }, 12: { desc: 'Lätta byar av regn och snöblandat', icon: '🌨️' },
    13: { desc: 'Måttliga byar av regn och snöblandat', icon: '🌨️' }, 14: { desc: 'Kraftiga byar av regn och snöblandat', icon: '🌨️' },
    15: { desc: 'Lätta snöbyar', icon: '❄️' }, 16: { desc: 'Måttliga snöbyar', icon: '❄️' },
    17: { desc: 'Kraftiga snöbyar', icon: '❄️' }, 18: { desc: 'Lätt regn', icon: '🌧️' },
    19: { desc: 'Måttligt regn', icon: '🌧️' }, 20: { desc: 'Kraftigt regn', icon: '🌧️' },
    21: { desc: 'Åska', icon: '⛈️' }, 22: { desc: 'Lätt regn och snöblandat', icon: '🌨️' },
    23: { desc: 'Måttligt regn och snöblandat', icon: '🌨️' }, 24: { desc: 'Kraftigt regn och snöblandat', icon: '🌨️' },
    25: { desc: 'Lätt snöfall', icon: '❄️' }, 26: { desc: 'Måttligt snöfall', icon: '❄️' },
    27: { desc: 'Kraftigt snöfall', icon: '❄️' }
};

function getMoonPhase(year, month, day) {
    let c = e = jd = b = 0;
    if (month < 3) { year--; month += 12; }
    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd);
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;
    const phases = ['New Moon', 'Waxing Crescent Moon', 'Quarter Moon', 'Waxing Gibbous Moon', 'Full Moon', 'Waning Gibbous Moon', 'Last Quarter Moon', 'Waning Crescent Moon'];
    return phases[b] || 'Error';
}

function getMoonScore(phase) {
    if (phase === 'New Moon' || phase === 'Full Moon') return 3;
    if (phase.includes('Gibbous')) return 2;
    if (phase.includes('Crescent')) return 1;
    if (phase.includes('Quarter')) return 0;
    return 0;
}

function getRating(total) {
    if (total <= 0) return 'Sämre';
    if (total <= 2) return 'Normalt';
    if (total <= 4) return 'Bra';
    return 'Perfekt';
}

function getWeatherScore(dayData) {
    let score = 0;
    if (dayData.msl && dayData.msl.length > 1) {
        const delta = dayData.msl[dayData.msl.length - 1] - dayData.msl[0];
        if (delta < -6) score += 3; else if (delta < -3) score += 2; else if (delta < 0) score += 1;
        else if (delta > 6) score -= 3; else if (delta > 3) score -= 2;
    }
    if (dayData.ws) {
        const windAvg = dayData.ws.reduce((a, b) => a + b, 0) / dayData.ws.length;
        if (windAvg < 3) score += 1; else if (windAvg > 8) score -= 2;
    }
    if (dayData.pmean) {
        const precipAvg = dayData.pmean.reduce((a, b) => a + b, 0) / dayData.pmean.length;
        if (precipAvg > 0 && precipAvg < 1) score += 1; else if (precipAvg > 3) score -= 1;
    }
    return score;
}

function getMode(arr) {
    if (!arr || arr.length === 0) return null;
    const freq = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    return parseInt(Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b));
}

function groupByDay(timeSeries) {
    const days = {};
    if (!timeSeries) return days;
    timeSeries.forEach(ts => {
        const dt = new Date(ts.validTime);
        const dateStr = dt.toLocaleDateString('sv-SE');
        const hour = dt.getHours();
        if (hour < 6 || hour > 21) return;
        if (!days[dateStr]) days[dateStr] = {};
        ts.parameters.forEach(p => {
            if (!days[dateStr][p.name]) days[dateStr][p.name] = [];
            days[dateStr][p.name].push(p.values[0]);
        });
    });
    return days;
}

async function fetchLocationName(lat, lon) {
    try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&countrycodes=se,no,fi`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.village || '';
        const country = geoData.address.country || '';
        return (city ? city + ', ' : '') + country;
    } catch (error) {
        return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
}

// ---- HUVUDLOGIK FÖR WORKERN ----

self.addEventListener('message', async (e) => {
    const { type, lat, lon } = e.data;

    try {
        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(2)}/lat/${lat.toFixed(2)}/data.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const weatherData = await response.json();
        const placeName = await fetchLocationName(lat, lon);

        if (type === 'fetchForecast') {
            const current = weatherData.timeSeries[0].parameters;
            const today = new Date();
            const phase = getMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
            const weatherDays = groupByDay(weatherData.timeSeries);
            const weatherScore = weatherDays[today.toLocaleDateString('sv-SE')] ? getWeatherScore(weatherDays[today.toLocaleDateString('sv-SE')]) : 0;
            const rating = getRating(getMoonScore(phase) + weatherScore);

            const currentWeatherHtml = `
                <div class="weather-card">
                    <h2>Aktuellt väder i ${placeName}</h2>
                    <p><span class="icon">${weatherIcons[current.find(p=>p.name==='Wsymb2').values[0]].icon}</span> ${weatherIcons[current.find(p=>p.name==='Wsymb2').values[0]].desc}</p>
                    <p>Temperatur: ${current.find(p=>p.name==='t').values[0]} °C</p>
                    <p>Vind: ${current.find(p=>p.name==='ws').values[0]} m/s</p>
                    <p>Lufttryck: ${current.find(p=>p.name==='msl').values[0]} hPa</p>
                    <p><strong>Fiskeprognos idag: ${rating}</strong></p>
                </div>`;
            self.postMessage({ type: 'currentWeatherUpdate', payload: { html: currentWeatherHtml }});

            let table = '<table><tr><th>Datum</th><th>Prognos</th><th>Väderprognos (5 dagar)</th></tr>';
            const dayKeys = Object.keys(weatherDays).slice(0, 5);
            for (let i = 0; i < 60; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toLocaleDateString('sv-SE');
                const phase = getMoonPhase(date.getFullYear(), date.getMonth() + 1, date.getDate());
                const moonScore = getMoonScore(phase);
                let weatherScore = 0;
                let weatherInfo = '';

                if (weatherDays[dateStr] && dayKeys.includes(dateStr)) {
                    const dayData = weatherDays[dateStr];
                    weatherScore = getWeatherScore(dayData);
                    const avgTemp = (dayData.t.reduce((a, b) => a + b, 0) / dayData.t.length).toFixed(1);
                    const iconData = weatherIcons[getMode(dayData.Wsymb2) || 1];
                    weatherInfo = `Medeltemp: ${avgTemp} °C, Väder: ${iconData.icon} ${iconData.desc}`;
                }
                table += `<tr><td>${dateStr}</td><td>${getRating(moonScore + weatherScore)}</td><td>${weatherInfo}</td></tr>`;
            }
            table += '</table>';
            self.postMessage({ type: 'forecastTableUpdate', payload: { html: table } });

        } else if (type === 'fetchMiniWeather') {
            const current = weatherData.timeSeries[0].parameters;
            const today = new Date();
            const phase = getMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
            const weatherDays = groupByDay(weatherData.timeSeries);
            const weatherScore = weatherDays[today.toLocaleDateString('sv-SE')] ? getWeatherScore(weatherDays[today.toLocaleDateString('sv-SE')]) : 0;
            const rating = getRating(getMoonScore(phase) + weatherScore);

            const infoText = `<strong>Aktuellt väder i ${placeName}:</strong> ${weatherIcons[current.find(p=>p.name==='Wsymb2').values[0]].icon}, <strong>Fiske idag: ${rating}</strong>, Temp: ${current.find(p=>p.name==='t').values[0]} °C, Vind: ${current.find(p=>p.name==='ws').values[0]} m/s`;
            const miniWeatherHtml = `<div class="marquee">${infoText}</div>`;
            self.postMessage({ type: 'miniWeatherUpdate', payload: { html: miniWeatherHtml }});
        }
    } catch (error) {
        self.postMessage({ type: 'error', payload: { message: `Ett fel uppstod: ${error.message}` } });
    }
});