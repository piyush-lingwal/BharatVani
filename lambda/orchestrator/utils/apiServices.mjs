/**
 * BharatVani — Real-Time API Services
 * Fetches live data: weather, news, gold/silver prices
 */

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';

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
    if (!WEATHER_API_KEY) {
        return `Mausam ki jaankari ke liye Indian Meteorological Department helpline 1800-180-1717 par call karein ya mausam.imd.gov.in par dekhein.`;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${WEATHER_API_KEY}&units=metric&lang=hi`;
        const response = await fetch(url);

        if (!response.ok) {
            return `${city} ka mausam abhi mil nahi raha. IMD helpline 1800-180-1717 par call karein.`;
        }

        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const condition = data.weather[0].main;
        const hindiCondition = WEATHER_HINDI[condition] || data.weather[0].description;
        const windSpeed = Math.round(data.wind.speed * 3.6); // m/s to km/h

        return `LIVE WEATHER for ${city}: Temperature ${temp}°C (feels like ${feelsLike}°C), ${hindiCondition}, humidity ${humidity}%, wind ${windSpeed} km/h.`;
    } catch (err) {
        console.error('Weather API error:', err.message);
        return `Mausam data abhi available nahi hai. IMD helpline: 1800-180-1717`;
    }
}

/**
 * Fetch top Indian news headlines
 */
export async function getNews() {
    if (!NEWS_API_KEY) {
        return `Taza khabar ke liye DD News ya All India Radio sunein, ya news.google.com par dekhein.`;
    }

    try {
        const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=3&apiKey=${NEWS_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            return `News abhi load nahi ho rahi. DD News ya All India Radio sunein.`;
        }

        const data = await response.json();
        const headlines = data.articles.slice(0, 3).map((a, i) =>
            `${i + 1}. ${a.title}`
        ).join(' | ');

        return `TODAY'S TOP HEADLINES: ${headlines}`;
    } catch (err) {
        console.error('News API error:', err.message);
        return `News service abhi available nahi hai.`;
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

    const results = [];

    for (const need of needs) {
        switch (need.type) {
            case 'weather':
                results.push(await getWeather(need.city));
                break;
            case 'news':
                results.push(await getNews());
                break;
            case 'gold':
                results.push(await getGoldPrice());
                break;
        }
    }

    return results.join('\n');
}
