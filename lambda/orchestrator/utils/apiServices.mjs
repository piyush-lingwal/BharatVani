/**
 * BharatVani — Real-Time API Services
 * Fetches live data: weather, news, gold/silver prices, Tavily web search
 * Production: DynamoDB cache layer prevents redundant API calls
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Singleton DynamoDB client (reused across warm Lambda invocations)
const _ddbClient = new DynamoDBClient({});
const _docClient = DynamoDBDocumentClient.from(_ddbClient);
const CACHE_TABLE = process.env.CACHE_TABLE || '';

/**
 * Read from DynamoDB cache
 * Returns cached string value or null if miss/expired
 */
async function getCachedData(key) {
    if (!CACHE_TABLE) return null;
    try {
        const result = await _docClient.send(new GetCommand({
            TableName: CACHE_TABLE,
            Key: { cacheKey: key }
        }));
        const item = result.Item;
        if (!item) return null;
        // DynamoDB TTL is eventually consistent — double-check expiry client-side
        if (item.ttl && item.ttl < Math.floor(Date.now() / 1000)) return null;
        console.log('Cache HIT:', key);
        return item.value;
    } catch (err) {
        console.warn('Cache read error (non-fatal):', err.message);
        return null;
    }
}

/**
 * Write to DynamoDB cache with TTL
 * @param {string} key   - cache key (e.g. 'weather#Delhi')
 * @param {string} value - data to cache
 * @param {number} ttlMinutes - how long to cache
 */
async function setCachedData(key, value, ttlMinutes) {
    if (!CACHE_TABLE || !value) return;
    try {
        const ttl = Math.floor(Date.now() / 1000) + (ttlMinutes * 60);
        await _docClient.send(new PutCommand({
            TableName: CACHE_TABLE,
            Item: { cacheKey: key, value, ttl, cachedAt: new Date().toISOString() }
        }));
        console.log('Cache SET:', key, `(TTL: ${ttlMinutes}min)`);
    } catch (err) {
        console.warn('Cache write error (non-fatal):', err.message);
        // Cache failures are non-fatal — API will be called directly
    }
}

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
    // Romanized
    'dilli': 'Delhi', 'delhi': 'Delhi', 'nai dilli': 'New Delhi', 'new delhi': 'New Delhi',
    'mumbai': 'Mumbai', 'bambai': 'Mumbai', 'bombay': 'Mumbai',
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
    'gurgaon': 'Gurgaon', 'gurugram': 'Gurgaon',
    // Devanagari — speech recognition returns these
    'दिल्ली': 'Delhi', 'नई दिल्ली': 'New Delhi',
    'मुंबई': 'Mumbai', 'बंबई': 'Mumbai',
    'कोलकाता': 'Kolkata',
    'चेन्नई': 'Chennai',
    'बेंगलुरु': 'Bangalore', 'बैंगलोर': 'Bangalore',
    'हैदराबाद': 'Hyderabad',
    'पुणे': 'Pune',
    'जयपुर': 'Jaipur',
    'लखनऊ': 'Lucknow',
    'अहमदाबाद': 'Ahmedabad',
    'चंडीगढ़': 'Chandigarh',
    'पटना': 'Patna',
    'भोपाल': 'Bhopal',
    'देहरादून': 'Dehradun',
    'शिमला': 'Shimla',
    'श्रीनगर': 'Srinagar',
    'वाराणसी': 'Varanasi', 'बनारस': 'Varanasi', 'काशी': 'Varanasi',
    'आगरा': 'Agra',
    'अमृतसर': 'Amritsar',
    'इंदौर': 'Indore',
    'नागपुर': 'Nagpur',
    'गुवाहाटी': 'Guwahati',
    'रांची': 'Ranchi',
    'कोच्चि': 'Kochi',
    'गोवा': 'Goa',
    'नोएडा': 'Noida',
    'गुड़गांव': 'Gurgaon', 'गुरुग्राम': 'Gurgaon'
};

/**
 * Detect if query needs real-time data and what type
 */
export function detectLiveDataNeed(userText) {
    const text = userText.toLowerCase();
    const needs = [];

    // Weather keywords — Latin + Devanagari (speech recognition returns Devanagari for hi-IN)
    const weatherWords = [
        'mausam', 'weather', 'thand', 'garmi', 'barish', 'baarish', 'taapmaan',
        'temperature', 'dhoop', 'kohra', 'fog', 'hawa', 'toofan', 'aandhi',
        'मौसम', 'बारिश', 'बरसात', 'ठंड', 'गर्मी', 'तापमान', 'धूप',
        'कोहरा', 'हवा', 'तूफान', 'आंधी', 'बर्फ', 'ओले'
    ];
    if (weatherWords.some(w => text.includes(w) || userText.includes(w))) {
        const city = extractCity(userText);
        needs.push({ type: 'weather', city });
    }

    // News keywords — Latin + Devanagari
    const newsWords = [
        'khabar', 'news', 'samachar', 'taza khabar', 'headline', 'aaj ki khabar',
        'kya chal raha', 'kya ho raha', 'current affairs',
        'खबर', 'खबरें', 'समाचार', 'ताजा खबर', 'आज की खबर', 'न्यूज़', 'न्यूज'
    ];
    if (newsWords.some(w => text.includes(w) || userText.includes(w))) {
        needs.push({ type: 'news' });
    }

    // Gold/silver keywords — Latin + Devanagari
    const goldWords = [
        'sone', 'sona', 'gold', 'chandi', 'silver', 'bhav', 'sone ka dam',
        'सोना', 'सोने', 'चांदी', 'सोने का भाव', 'सोने की कीमत', 'गोल्ड'
    ];
    if (goldWords.some(w => text.includes(w) || userText.includes(w))
        && !text.includes('fasal') && !text.includes('gehu')
        && !userText.includes('फसल') && !userText.includes('गेहूं')) {
        needs.push({ type: 'gold' });
    }

    // Tavily web search — for anything needing live internet data
    // Only trigger if NOT already handled by specific APIs above
    const webSearchWords = [
        // Prices & rates
        'petrol', 'diesel', 'lpg', 'rasoi gas', 'gas cylinder', 'bijli', 'electricity bill',
        'paani ka bill', 'sabzi', 'mandi', 'gehu', 'dhan', 'chawal', 'fasal', 'bhav',
        // Transport
        'train', 'rail', 'bus', 'flight', 'hawai jahaz', 'ticket', 'pnr', 'late',
        // Government updates
        'yojana', 'scheme', 'sarkar', 'government', 'pm kisan', 'ration', 'pension',
        'aadhar', 'pan card', 'voter id', 'driving licence', 'paisa', 'kist', 'installment',
        // Jobs & employment
        'naukri', 'job', 'bharti', 'vacancy', 'rojgar', 'berozgaari',
        // Health
        'hospital', 'dawai', 'medicine', 'vaccine', 'doctor', 'ayushman',
        // Finance
        'bank', 'loan', 'mudra', 'byaj', 'interest', 'sensex', 'share', 'market',
        // Devanagari
        'पेट्रोल', 'डीजल', 'गैस सिलेंडर', 'बिजली', 'सब्जी', 'मंडी', 'गेहूं', 'धान',
        'ट्रेन', 'रेल', 'बस', 'टिकट', 'योजना', 'सरकार', 'राशन', 'पेंशन',
        'नौकरी', 'भर्ती', 'रोजगार', 'अस्पताल', 'दवाई', 'बैंक', 'लोन', 'ब्याज'
    ];
    const alreadyCovered = needs.length > 0;
    if (!alreadyCovered && webSearchWords.some(w => text.includes(w) || userText.includes(w))) {
        needs.push({ type: 'web_search', query: userText });
    }

    return needs;
}

/**
 * Extract city name from Hindi text
 */
function extractCity(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const origWords = text.split(/\s+/); // original for Devanagari

    // Check 2-word Devanagari combos
    for (let i = 0; i < origWords.length - 1; i++) {
        const twoWord = origWords[i] + ' ' + origWords[i + 1];
        if (CITY_MAP[twoWord]) return CITY_MAP[twoWord];
    }

    // Check single Devanagari words
    for (const word of origWords) {
        if (CITY_MAP[word]) return CITY_MAP[word];
    }

    // Check 2-word romanized combos
    for (let i = 0; i < words.length - 1; i++) {
        const twoWord = words[i] + ' ' + words[i + 1];
        if (CITY_MAP[twoWord]) return CITY_MAP[twoWord];
    }

    // Check single romanized words
    for (const word of words) {
        if (CITY_MAP[word]) return CITY_MAP[word];
    }

    return 'Delhi'; // Default
}

/**
 * Fetch weather from OpenWeatherMap
 */
export async function getWeather(city = 'Delhi') {
    // Cache check first — weather changes slowly, 30 min TTL is accurate
    const cacheKey = `weather#${city.toLowerCase()}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
    console.log('getWeather called for city:', city, '| key present:', !!WEATHER_API_KEY);
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
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const condition = data.weather[0].main;
        const hindiCondition = WEATHER_HINDI[condition] || data.weather[0].description;
        const windSpeed = Math.round(data.wind.speed * 3.6);

        const result = `LIVE WEATHER ${city}: ${temp}°C (feels ${feelsLike}°C), ${hindiCondition}, humidity ${humidity}%, wind ${windSpeed}km/h.`;
        await setCachedData(cacheKey, result, 30); // cache 30 minutes
        return result;
    } catch (err) {
        console.error('Weather API error:', err.message);
        return '';
    }
}

/**
 * Fetch top Indian news headlines
 */
export async function getNews() {
    // Cache check — news headlines refresh hourly
    const cacheKey = 'news#headlines';
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    console.log('getNews called — using NDTV RSS feed');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const url = 'https://feeds.feedburner.com/ndtvnews-india-news';
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 BharatVani/1.0' }
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const xml = await response.text();
        const headlines = [];
        let pos = 0;
        let skippedFirst = false;
        while (headlines.length < 3) {
            const s = xml.indexOf('<title>', pos);
            if (s === -1) break;
            const e = xml.indexOf('</title>', s);
            if (e === -1) break;
            let title = xml.substring(s + 7, e).trim();
            if (title.startsWith('<![CDATA[')) title = title.slice(9, title.lastIndexOf(']]>')).trim();
            pos = e + 8;
            if (!skippedFirst) { skippedFirst = true; continue; }
            if (title.length > 5) headlines.push((headlines.length + 1) + '. ' + title);
        }
        const headlineText = headlines.join(' | ');
        const result = headlineText ? 'TODAY\'S TOP INDIA NEWS: ' + headlineText : '';
        if (result) await setCachedData(cacheKey, result, 60); // cache 60 minutes
        return result;
    } catch (err) {
        console.error('News RSS error:', err.message);
        return '';
    }
}

/**
 * Fetch gold and silver prices
 */
export async function getGoldPrice() {
    // Use Tavily to get live gold price in India
    return searchWeb('aaj sone ka bhav India gold rate today per 10 gram INR');
}

/**
 * Tavily Web Search — real-time internet search for any query
 */
export async function searchWeb(query) {
    // Cache: 15min for price-like queries, 60min for general
    const isPriceQuery = /petrol|diesel|gold|silver|rate|price|bhav|sone|dam/i.test(query);
    const cacheTtl = isPriceQuery ? 15 : 60;
    const cacheKey = `web#${query.toLowerCase().substring(0, 80)}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
    console.log('searchWeb called | key present:', !!TAVILY_API_KEY, '| query:', query.substring(0, 50));
    if (!TAVILY_API_KEY) return '';

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query + ' India ' + today,
                search_depth: 'advanced',
                include_answer: true,
                max_results: 5,
                include_raw_content: false
            })
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        console.log('Tavily response received, answer length:', data.answer?.length || 0);

        let result = '';
        if (data.answer && data.answer.length > 20) {
            result = 'WEB SEARCH RESULT: ' + data.answer;
        } else {
            // Fallback: use top result snippets
            const snippets = (data.results || []).slice(0, 2)
                .map(r => r.content ? r.content.substring(0, 250) : '')
                .filter(Boolean)
                .join(' | ');
            result = snippets ? 'WEB SEARCH: ' + snippets : '';
        }

        if (result) await setCachedData(cacheKey, result, cacheTtl);
        return result;
    } catch (err) {
        console.error('Tavily error:', err.message);
        return '';
    }
}

export async function fetchLiveData(needs) {
    if (needs.length === 0) return '';

    // Run all API calls in parallel for speed
    const promises = needs.map(need => {
        switch (need.type) {
            case 'weather': return getWeather(need.city);
            case 'news': return getNews();
            case 'gold': return getGoldPrice();
            case 'web_search': return searchWeb(need.query);
            default: return Promise.resolve('');
        }
    });

    const results = await Promise.allSettled(promises);
    return results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value)
        .join('\n');
}
