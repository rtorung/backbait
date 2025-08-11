self.addEventListener('message', function(e) {
    const { weatherDays, dayKeys } = e.data;

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

    let table = '<table><tr><th>Datum</th><th>Prognos</th><th>Väderprognos (endast 5 dagar)</th></tr>';
    const today = new Date();
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

    self.postMessage(table);
});