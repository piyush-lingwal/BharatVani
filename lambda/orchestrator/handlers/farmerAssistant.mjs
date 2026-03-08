/**
 * BharatVani — Farmer Assistant Handler
 * Handles crop prices, weather, and farming tips
 *
 * v2: Language-aware — uses session.language to pick response text
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Cache
let cachedPrices = null;
let cachedTips = null;

function loadMandiPrices() {
    if (cachedPrices) return cachedPrices;
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const searchPaths = [
        join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'mandi_prices.json'),
        join('/var/task', 'knowledge-base', 'agriculture', 'mandi_prices.json')
    ];
    for (const path of searchPaths) {
        try {
            cachedPrices = JSON.parse(readFileSync(path, 'utf-8'));
            return cachedPrices;
        } catch (e) { continue; }
    }
    cachedPrices = { prices: [] };
    return cachedPrices;
}

function loadFarmingTips() {
    if (cachedTips) return cachedTips;
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const searchPaths = [
        join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'farming_tips.json'),
        join('/var/task', 'knowledge-base', 'agriculture', 'farming_tips.json')
    ];
    for (const path of searchPaths) {
        try {
            cachedTips = JSON.parse(readFileSync(path, 'utf-8'));
            return cachedTips;
        } catch (e) { continue; }
    }
    cachedTips = { seasonal_tips: {}, general_tips: [] };
    return cachedTips;
}

// Crop name aliases (Hindi to English)
const CROP_ALIASES = {
    'tamatar': 'Tomato', 'tomato': 'Tomato',
    'pyaz': 'Onion', 'pyaaz': 'Onion', 'onion': 'Onion',
    'aloo': 'Potato', 'potato': 'Potato',
    'gehun': 'Wheat', 'gehu': 'Wheat', 'wheat': 'Wheat',
    'chawal': 'Rice', 'dhan': 'Rice', 'rice': 'Rice',
    'sarson': 'Mustard', 'mustard': 'Mustard',
    'ganna': 'Sugarcane', 'sugarcane': 'Sugarcane',
    'hari mirch': 'Green Chilli', 'mirch': 'Green Chilli', 'chilli': 'Green Chilli',
    'phool gobhi': 'Cauliflower', 'gobhi': 'Cauliflower', 'cauliflower': 'Cauliflower',
    'patta gobhi': 'Cabbage', 'bandh gobhi': 'Cabbage', 'cabbage': 'Cabbage'
};

// Multilingual response templates for farmer queries
const TEMPLATES = {
    'hi-IN': {
        askWhichCrop: 'Kis fasal ka bhav jaanna chahte hain? Jaise tamatar, pyaz, aloo, gehun, chawal?',
        cropNotFound: (name) => `Maaf kijiye, "${name}" ka bhav abhi available nahi hai. Tamatar, pyaz, aloo, gehun ka bhav pooch sakte hain.`,
        priceInCity: (crop, city, price) => `${crop} ka bhav ${city} mein ₹${price} per kilo hai.`,
        priceAll: (crop, priceList, bestCity) => `Aaj ${crop} ka bhav: ${priceList}. Sabse accha rate ${bestCity} mein hai.`,
        weatherFallback: (city) => `${city} ke mausam ki jaankari live data se mil rahi hai. Kuch aur poochna hai?`,
        farmingFallback: 'Har 2 saal mein mitti ki jaanch karwaayein. Soil Health Card scheme mein free hoti hai.'
    },
    'en-IN': {
        askWhichCrop: 'Which crop\'s price would you like to know? For example, tomato, onion, potato, wheat, rice?',
        cropNotFound: (name) => `Sorry, the price of "${name}" is not available right now. You can ask about tomato, onion, potato, or wheat prices.`,
        priceInCity: (crop, city, price) => `${crop} is priced at ₹${price} per kg in ${city}.`,
        priceAll: (crop, priceList, bestCity) => `Today's ${crop} prices: ${priceList}. Best rate is in ${bestCity}.`,
        weatherFallback: (city) => `Weather information for ${city} is being fetched from live data. Anything else you'd like to know?`,
        farmingFallback: 'Get your soil tested every 2 years. It\'s free under the Soil Health Card scheme.'
    },
    'ta-IN': {
        askWhichCrop: 'Enna payirin vilai therinja venum? Udaaranathukku thakkali, vengaayam, urulaikizhangu?',
        cropNotFound: (name) => `Mannikkavum, "${name}" vilai ippo kidaiyaadhu. Thakkali, vengaayam, urulaikizhangu vilai kekkalam.`,
        priceInCity: (crop, city, price) => `${crop} vilai ${city}-la ₹${price} per kg.`,
        priceAll: (crop, priceList, bestCity) => `Innaiku ${crop} vilai: ${priceList}. Sirantha vilai ${bestCity}-la irukku.`,
        weatherFallback: (city) => `${city} vaanilai thagaval live data-lirundu varugiradhu. Vera enna venum?`,
        farmingFallback: 'Mannai 2 varudathukku oru murai parisodhanai seyyungal. Soil Health Card thittathil ilavasamaaga kidaikkum.'
    },
    'te-IN': {
        askWhichCrop: 'Ee panta dhara telusukovaalanukuntunaaru? Udaaharanaku tomato, ulli, aalugadda, godumalu?',
        cropNotFound: (name) => `Kshaminchandi, "${name}" dhara ippudu andubatulo ledu. Tomato, ulli, aalugadda dhara adagachu.`,
        priceInCity: (crop, city, price) => `${crop} dhara ${city}-lo ₹${price} per kg.`,
        priceAll: (crop, priceList, bestCity) => `Ee roju ${crop} dharalu: ${priceList}. Manchhi dhara ${bestCity}-lo undi.`,
        weatherFallback: (city) => `${city} vaataavarana samacharam live data nundi vastondi. Inka em kaavali?`,
        farmingFallback: 'Prati 2 sanvatsaraalaku oka saari matti pariksha cheyinchandi. Soil Health Card padakamlo idi free.'
    },
    'bn-IN': {
        askWhichCrop: 'Kon fosholer dam jante chaichen? Jemon tomato, peyaj, aloo, gom, chaal?',
        cropNotFound: (name) => `Dukkhito, "${name}"-er dam ekhon paowa jachhe na. Tomato, peyaj, aloo, gom-er dam jigges korte paren.`,
        priceInCity: (crop, city, price) => `${crop}-er dam ${city}-te ₹${price} proti kg.`,
        priceAll: (crop, priceList, bestCity) => `Aajker ${crop}-er dam: ${priceList}. Sorbottromo dam ${bestCity}-te.`,
        weatherFallback: (city) => `${city}-r abohaowa tothyo live data theke ashche. Aar kichu jante chaichen?`,
        farmingFallback: 'Protidin 2 bochor por por maati poriksha korun. Soil Health Card scheme-e ei ta free.'
    },
    'mr-IN': {
        askWhichCrop: 'Kontya pikache bhav janun ghyayche aahe? Udaaharnaarth tamatar, kanda, batata, gahu?',
        cropNotFound: (name) => `Maaf kara, "${name}"-cha bhav sadhya uplabdh nahi. Tamatar, kanda, batata, gahu baddal vicharu shakta.`,
        priceInCity: (crop, city, price) => `${crop}-cha bhav ${city} madhe ₹${price} pratikg aahe.`,
        priceAll: (crop, priceList, bestCity) => `Aajcha ${crop} bhav: ${priceList}. Sarvottam dar ${bestCity} madhe aahe.`,
        weatherFallback: (city) => `${city}-cha havaman mahiti live data madhun yetoy. Aaankhi kaahi hava ka?`,
        farmingFallback: 'Dari 2 varshaanni mati tapasni kara. Soil Health Card yojane madhe he muft aahe.'
    }
};

function getTemplate(language) {
    return TEMPLATES[language] || TEMPLATES['hi-IN'];
}

/**
 * Handle farmer assistant queries
 */
export async function handleFarmerQuery(intent, entities, session) {
    const language = session?.language || 'hi-IN';

    switch (intent) {
        case 'crop_price':
            return handleCropPrice(entities, language);
        case 'weather_forecast':
            return handleWeather(entities, language);
        case 'farming_advice':
            return handleFarmingAdvice(entities, language);
        default:
            return handleCropPrice(entities, language); // default to crop prices
    }
}

/**
 * Handle crop price queries
 */
function handleCropPrice(entities, language) {
    const cropName = entities?.crop_name;
    const city = entities?.city;
    const t = getTemplate(language);

    if (!cropName) {
        return {
            response_text: t.askWhichCrop,
            sms_content: null,
            next_state: 'listening'
        };
    }

    const data = loadMandiPrices();
    const resolvedCrop = resolveCropName(cropName);

    const cropData = data.prices?.find(p =>
        p.crop.toLowerCase() === resolvedCrop?.toLowerCase() ||
        p.crop_hindi === cropName
    );

    if (!cropData) {
        return {
            response_text: t.cropNotFound(cropName),
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Use Hindi name for Hindi, English name for others
    const displayCrop = language === 'hi-IN' ? (cropData.crop_hindi || cropData.crop) : cropData.crop;

    // If city specified, filter for that city
    if (city) {
        const cityData = cropData.markets.find(m =>
            m.city.toLowerCase() === city.toLowerCase()
        );

        if (cityData) {
            return {
                response_text: t.priceInCity(displayCrop, cityData.city, cityData.price_per_kg),
                sms_content: null,
                next_state: 'listening'
            };
        }
    }

    // Show all cities
    const priceList = cropData.markets.map(m =>
        `${m.city}: ₹${m.price_per_kg}/kg`
    ).join(', ');

    // Find best price
    const bestMarket = cropData.markets.reduce((best, m) =>
        m.price_per_kg > best.price_per_kg ? m : best
    );

    return {
        response_text: t.priceAll(displayCrop, priceList, bestMarket.city),
        sms_content: `${cropData.crop} (${cropData.crop_hindi}) - Market Prices:\n${cropData.markets.map(m => `${m.city} ${m.market}: ₹${m.price_per_kg}/kg`).join('\n')}`,
        next_state: 'listening'
    };
}

/**
 * Handle weather queries
 * Real weather is fetched by apiServices.mjs and injected into Claude's context.
 * This handler returns a fallback only if the live pipeline missed it.
 */
function handleWeather(entities, language) {
    const city = entities?.city || 'Delhi';
    const t = getTemplate(language);

    return {
        response_text: t.weatherFallback(city),
        sms_content: null,
        next_state: 'listening'
    };
}

/**
 * Handle farming advice queries
 */
function handleFarmingAdvice(entities, language) {
    const tips = loadFarmingTips();
    const crop = entities?.crop_name;
    const t = getTemplate(language);

    // Determine current season
    const month = new Date().getMonth() + 1;
    let season = 'rabi';
    if (month >= 6 && month <= 10) season = 'kharif';
    else if (month >= 3 && month <= 5) season = 'zaid';

    const seasonalTips = tips.seasonal_tips?.[season]?.tips || [];
    const generalTips = tips.general_tips || [];

    // Find relevant tip
    let relevantTip = null;

    if (crop) {
        const resolvedCrop = resolveCropName(crop);
        relevantTip = seasonalTips.find(t =>
            t.crop?.toLowerCase() === resolvedCrop?.toLowerCase()
        );
    }

    if (!relevantTip && seasonalTips.length > 0) {
        relevantTip = seasonalTips[Math.floor(Math.random() * seasonalTips.length)];
    }

    if (relevantTip) {
        // Use Hindi tip for Hindi, English tip for other languages
        const tipText = (language === 'hi-IN')
            ? (relevantTip.tip || relevantTip.tip_hindi)
            : (relevantTip.tip_english || relevantTip.tip);
        return {
            response_text: tipText,
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Fallback to general tip
    const generalTip = generalTips[Math.floor(Math.random() * generalTips.length)];
    if (generalTip) {
        const tipText = (language === 'hi-IN')
            ? (generalTip.tip_hindi || generalTip.tip)
            : (generalTip.tip || generalTip.tip_hindi);
        return {
            response_text: tipText,
            sms_content: null,
            next_state: 'listening'
        };
    }

    return {
        response_text: t.farmingFallback,
        sms_content: null,
        next_state: 'listening'
    };
}

/**
 * Resolve Hindi crop name to English
 */
function resolveCropName(name) {
    if (!name) return null;
    const normalized = name.toLowerCase().trim();
    return CROP_ALIASES[normalized] || name;
}
