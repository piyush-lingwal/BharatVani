/**
 * BharatVani — Real-Time API Services
 * Fetches live data: weather, news, gold/silver prices
 */

// API keys are read inside each function (not module-level) to ensure Lambda env vars are always fresh

// Hindi weather condition map
const WEATHER_HINDI = {
    'Clear': 'saaf aasmaan',
    'Clouds': 'badal chhaye hain',
    'Rain': 'baarish ho rahi hai',
    'Drizzle': 'halki baarish',
    'Thunderstorm': 'aandhi-toofan',
    'Snow': 'barf gir rahi hai',
    'Mist': 'dhundh hai',
    'Haze': 'dhundh hai',
    'Fog': 'kohra hai',
    'Dust': 'dhool bhari hawa',
    'Smoke': 'dhuaan'
};

// Major Indian cities with common Hindi names
const CITY_MAP = {
    'dilli': 'Delhi', 'delhi': 'Delhi', 'nai dilli': 'New Delhi',
    'mumbai': 'Mumbai', 'bambai': 'Mumbai',
    'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
    'chennai': 'Chennai', 'madras': 'Chennai',
    'bangalore': 'Bangalore', 'bengaluru': 'Bangalore',
    'hyderabad': 'Hyderabad',
    'pune': 'Pune', 'poona': 'Pune',
    'jaipur': 'Jaipur',
    'lucknow': 'Lucknow', 'lakhnau': 'Lucknow',
    'ahmedabad': 'Ahmedabad',
    'chandigarh': 'Chandigarh',
    'patna': 'Patna',
    'bhopal': 'Bhopal',
    'dehradun': 'Dehradun',
    'shimla': 'Shimla',
    'srinagar': 'Srinagar',
    'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
    'agra': 'Agra',
    'amritsar': 'Amritsar',
    'indore': 'Indore',
    'nagpur': 'Nagpur',
    'guwahati': 'Guwahati',
    'ranchi': 'Ranchi',
    'thiruvananthapuram': 'Thiruvananthapuram', 'trivandrum': 'Thiruvananthapuram',
    'kochi': 'Kochi', 'cochin': 'Kochi',
    'kerala': 'Thiruvananthapuram',
    'uttarakhand': 'Dehradun',
    'rajasthan': 'Jaipur',
    'up': 'Lucknow', 'uttar pradesh': 'Lucknow',
    'bihar': 'Patna',
    'mp': 'Bhopal', 'madhya pradesh': 'Bhopal',
    'goa': 'Goa',
    'noida': 'Noida',
    'gurgaon': 'Gurgaon', 'gurugram': 'Gurgaon'
};

/**
 * Detect if query needs real-time data and what type
 */
export function detectLiveDataNeed(userText) {
    const text = userText.toLowerCase();
    const needs = [];

    // Weather keywords
    const weatherWords = ['mausam', 'weather', 'thand', 'garmi', 'barish', 'baarish', 'taapmaan',
        'temperature', 'dhoop', 'kohra', 'fog', 'hawa', 'toofan', 'aandhi'];
    if (weatherWords.some(w => text.includes(w))) {
        const city = extractCity(text);
        needs.push({ type: 'weather', city });
    }

    // News keywords
    const newsWords = ['khabar', 'news', 'samachar', 'taza khabar', 'headline', 'aaj ki khabar',
        'kya chal raha', 'kya ho raha', 'current affairs'];
    if (newsWords.some(w => text.includes(w))) {
        needs.push({ type: 'news' });
    }

    // Gold/silver keywords
    const goldWords = ['sone', 'sona', 'gold', 'chandi', 'silver', 'bhav', 'rate',
        'sone ka dam', 'sone ki keemat', 'chandi ka dam'];
    if (goldWords.some(w => text.includes(w)) && !text.includes('fasal') && !text.includes('gehu')) {
        needs.push({ type: 'gold' });
    }

    return needs;
}

/**
 * Extract city name from Hindi text
 */
function extractCity(text) {
    const words = text.toLowerCase().split(/\s+/);

    // Check 2-word combinations first
    for (let i = 0; i < words.length - 1; i++) {
        const twoWord = words[i] + ' ' + words[i + 1];
        if (CITY_MAP[twoWord]) return CITY_MAP[twoWord];
    }

    // Check single words
    for (const word of words) {
        if (CITY_MAP[word]) return CITY_MAP[word];
    }

    return 'Delhi'; // Default
}

/**
 * Fetch weather from OpenWeatherMap
 */
export async function getWeather(city = 'Delhi') {
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
    console.log('getWeather called for city:', city, '| key present:', !!WEATHER_API_KEY, '| key length:', WEATHER_API_KEY.length);
    if (!WEATHER_API_KEY) {
        return `Mausam ki jaankari ke liye IMD helpline 1800-180-1717 par call karein.`;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${WEATHER_API_KEY}&units=metric`;
        console.log('Fetching weather URL:', url.replace(WEATHER_API_KEY, 'HIDDEN'));
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log('Weather data received:', data.main?.temp, data.weather?.[0]?.main);
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const condition = data.weather[0].main;
        const hindiCondition = WEATHER_HINDI[condition] || data.weather[0].description;
        const windSpeed = Math.round(data.wind.speed * 3.6);

        return `LIVE WEATHER ${city}: ${temp}°C (feels ${feelsLike}°C), ${hindiCondition}, humidity ${humidity}%, wind ${windSpeed}km/h.`;
    } catch (err) {
        console.error('Weather API error:', err.message);
        return '';
    }
}

/**
 * Fetch top Indian news headlines
 */
export async function getNews() {
    console.log('getNews called — using NDTV RSS feed');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        // NDTV India RSS — free, no auth, works from servers
        const url = 'https://feeds.feedburner.com/ndtvnews-india-news';
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 BharatVani/1.0' }
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const xml = await response.text();
        // Safe string-based title extraction (no regex to avoid syntax errors)
        const headlines = [];
        let pos = 0;
        let skippedFirst = false;
        while (headlines.length < 3) {
            const s = xml.indexOf('<title>', pos);
            if (s === -1) break;
            const e = xml.indexOf('</title>', s);
            if (e === -1) break;
            let title = xml.substring(s + 7, e).trim();
            // Strip CDATA if present
            if (title.startsWith('<![CDATA[')) title = title.slice(9, title.lastIndexOf(']]>')).trim();
            pos = e + 8;
            if (!skippedFirst) { skippedFirst = true; continue; } // skip feed title
            if (title.length > 5) headlines.push((headlines.length + 1) + '. ' + title);
        }
        const headlineText = headlines.join(' | ');
        console.log('News headlines fetched:', headlineText.substring(0, 100));
        return headlineText ? 'TODAY\'S TOP INDIA NEWS: ' + headlineText : '';
    } catch (err) {
        console.error('News RSS error:', err.message);
        return '';
    }
}

/**
 * Fetch gold and silver prices
 */
export async function getGoldPrice() {
    // Gold price estimation based on publicly available ranges
    // For real-time, integrate with a price API when key is available
    try {
        const url = 'https://www.goldapi.io/api/XAU/INR';
        // Without API key, provide helpful general info
        return `Sone ka latest bhav jaanne ke liye apne local sarafa bazaar mein sampark karein ya Google par "gold rate today" search karein. Sona generally 60,000-75,000 rupaye per 10 gram ke beech rehta hai.`;
    } catch (err) {
        return `Sone ka bhav abhi available nahi hai. Local sarafa bazaar mein sampark karein.`;
    }
}

/**
 * Fetch all required live data based on detected needs
 */
export async function fetchLiveData(needs) {
    if (needs.length === 0) return '';

    // Run all API calls in parallel for speed
    const promises = needs.map(need => {
        switch (need.type) {
            case 'weather': return getWeather(need.city);
            case 'news': return getNews();
            case 'gold': return getGoldPrice();
            default: return Promise.resolve('');
        }
    });

    const results = await Promise.allSettled(promises);
    return results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value)
        .join('\n');
}
