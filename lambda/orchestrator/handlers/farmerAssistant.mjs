/**
 * BharatVani — Farmer Assistant Handler
 * Handles crop prices, weather, and farming tips
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Cache
let cachedPrices = null;
let cachedTips = null;

function loadMandiPrices() {
    if (cachedPrices) return cachedPrices;
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const path = join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'mandi_prices.json');
        cachedPrices = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (err) {
        cachedPrices = { prices: [] };
    }
    return cachedPrices;
}

function loadFarmingTips() {
    if (cachedTips) return cachedTips;
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const path = join(__dirname, '..', '..', '..', 'knowledge-base', 'agriculture', 'farming_tips.json');
        cachedTips = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (err) {
        cachedTips = { seasonal_tips: {}, general_tips: [] };
    }
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

/**
 * Handle farmer assistant queries
 */
export async function handleFarmerQuery(intent, entities, session) {
    switch (intent) {
        case 'crop_price':
            return handleCropPrice(entities);
        case 'weather_forecast':
            return handleWeather(entities);
        case 'farming_advice':
            return handleFarmingAdvice(entities);
        default:
            return handleCropPrice(entities); // default to crop prices
    }
}

/**
 * Handle crop price queries
 */
function handleCropPrice(entities) {
    const cropName = entities?.crop_name;
    const city = entities?.city;

    if (!cropName) {
        return {
            response_text: 'Kis fasal ka bhav jaanna chahte hain? Jaise tamatar, pyaz, aloo, gehun, chawal?',
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
            response_text: `Maaf kijiye, "${cropName}" ka bhav abhi available nahi hai. Tamatar, pyaz, aloo, gehun ka bhav pooch sakte hain.`,
            sms_content: null,
            next_state: 'listening'
        };
    }

    // If city specified, filter for that city
    if (city) {
        const cityData = cropData.markets.find(m =>
            m.city.toLowerCase() === city.toLowerCase()
        );

        if (cityData) {
            return {
                response_text: `${cropData.crop_hindi} ka bhav ${cityData.city} mein ₹${cityData.price_per_kg} per kilo hai.`,
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
        response_text: `Aaj ${cropData.crop_hindi} ka bhav: ${priceList}. Sabse accha rate ${bestMarket.city} mein hai.`,
        sms_content: `${cropData.crop} (${cropData.crop_hindi}) - Aaj ke Mandi Bhav:\n${cropData.markets.map(m => `${m.city} ${m.market}: ₹${m.price_per_kg}/kg`).join('\n')}`,
        next_state: 'listening'
    };
}

/**
 * Handle weather queries (mock for hackathon)
 */
function handleWeather(entities) {
    const city = entities?.city || 'Delhi';

    // Real weather data is fetched by apiServices.mjs detectLiveDataNeed() and injected
    // into Claude's context BEFORE this handler runs. Claude's response already contains
    // accurate live weather. This handler returns a fallback only if the live pipeline missed it.
    return {
        response_text: `${city} ke mausam ki jaankari live data se mil rahi hai. Kuch aur poochna hai?`,
        sms_content: null,
        next_state: 'listening'
    };
}

/**
 * Handle farming advice queries
 */
function handleFarmingAdvice(entities) {
    const tips = loadFarmingTips();
    const crop = entities?.crop_name;

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
        return {
            response_text: relevantTip.tip,
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Fallback to general tip
    const generalTip = generalTips[Math.floor(Math.random() * generalTips.length)];
    return {
        response_text: generalTip?.tip_hindi || 'Har 2 saal mein mitti ki jaanch karwaayein. Soil Health Card scheme mein free hoti hai.',
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
