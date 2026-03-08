/**
 * BharatVani — Government Schemes Handler
 * Handles scheme info, eligibility, and how-to-apply queries
 * 
 * v2: Language-aware — uses session.language to pick Hindi vs English response text
 */

import { getSchemeDetails } from '../utils/bedrock.mjs';

// Map of common scheme name variations to scheme IDs
const SCHEME_ALIASES = {
    'pm kisan': 'pm_kisan',
    'pm-kisan': 'pm_kisan',
    'kisan samman': 'pm_kisan',
    'kisan yojana': 'pm_kisan',
    'ayushman': 'ayushman_bharat',
    'ayushman bharat': 'ayushman_bharat',
    'pmjay': 'ayushman_bharat',
    'jan arogya': 'ayushman_bharat',
    'ujjwala': 'ujjwala_yojana',
    'gas connection': 'ujjwala_yojana',
    'lpg': 'ujjwala_yojana',
    'awas': 'pm_awas_yojana',
    'awas yojana': 'pm_awas_yojana',
    'ghar': 'pm_awas_yojana',
    'house scheme': 'pm_awas_yojana',
    'sukanya': 'sukanya_samriddhi',
    'sukanya samriddhi': 'sukanya_samriddhi',
    'beti': 'sukanya_samriddhi',
    'jan dhan': 'jan_dhan_yojana',
    'bank account': 'jan_dhan_yojana',
    'zero balance': 'jan_dhan_yojana',
    'fasal bima': 'fasal_bima_yojana',
    'crop insurance': 'fasal_bima_yojana',
    'bima yojana': 'fasal_bima_yojana',
    'mudra': 'mudra_yojana',
    'mudra loan': 'mudra_yojana',
    'business loan': 'mudra_yojana',
    'soil health': 'soil_health_card',
    'mitti jaanch': 'soil_health_card',
    'soil card': 'soil_health_card',
    'atal pension': 'atal_pension_yojana',
    'pension': 'atal_pension_yojana',
    'retirement': 'atal_pension_yojana',
    // Newly added scheme aliases
    'mgnrega': 'mgnrega',
    'nrega': 'mgnrega',
    'rojgar guarantee': 'mgnrega',
    '100 din kaam': 'mgnrega',
    'mazdoori': 'mgnrega',
    'digital india': 'digital_india',
    'digilocker': 'digital_india',
    'ration': 'national_food_security',
    'ration card': 'national_food_security',
    'rashan': 'national_food_security',
    'food security': 'national_food_security',
    'gehu chawal': 'national_food_security',
    'free anaj': 'national_food_security',
    'scholarship': 'national_scholarship',
    'padhai': 'national_scholarship',
    'fees': 'national_scholarship',
    'chatravritti': 'national_scholarship',
    'jeevan jyoti': 'jeevan_jyoti_bima',
    'jeevan bima': 'jeevan_jyoti_bima',
    'life insurance': 'jeevan_jyoti_bima',
    'suraksha bima': 'suraksha_bima_yojana',
    'accident insurance': 'suraksha_bima_yojana',
    'durghatna bima': 'suraksha_bima_yojana',
    'svanidhi': 'pm_svanidhi',
    'thela': 'pm_svanidhi',
    'street vendor': 'pm_svanidhi',
    'rehri': 'pm_svanidhi',
    'vishwakarma': 'pm_vishwakarma',
    'karigar': 'pm_vishwakarma',
    'darzi': 'pm_vishwakarma',
    'lohar': 'pm_vishwakarma',
    'skill india': 'skill_india',
    'kaushal vikas': 'skill_india',
    'training': 'skill_india',
    'startup india': 'startup_india',
    'startup': 'startup_india',
    'new business': 'startup_india',
    'swachh bharat': 'swachh_bharat',
    'shauchalay': 'swachh_bharat',
    'toilet': 'swachh_bharat',
    'safai': 'swachh_bharat',
    'stand up india': 'stand_up_india',
    'sc st loan': 'stand_up_india',
    'jal jeevan': 'jal_jeevan',
    'paani': 'jal_jeevan',
    'nal se jal': 'jal_jeevan',
    'matru vandana': 'matru_vandana',
    'pregnancy': 'matru_vandana',
    'garbhvati': 'matru_vandana'
};

// Multilingual response templates
const TEMPLATES = {
    'hi-IN': {
        askWhichScheme: 'Kaunsi yojana ke baare mein jaanna chahte hain? Jaise PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
        schemeNotFound: (name) => `Maaf kijiye, "${name}" yojana ki jaankari abhi available nahi hai. PM-KISAN, Ayushman Bharat, ya Ujjwala ke baare mein pooch sakte hain.`,
        eligibilityPrefix: (schemeName) => `${schemeName} ke liye:`,
        eligibilitySuffix: 'Kya aur details chahiye?',
        documentsPrefix: (schemeName) => `${schemeName} ke liye ye documents chahiye:`,
        applyPrefix: (schemeName) => `${schemeName} apply karne ke liye:`
    },
    'en-IN': {
        askWhichScheme: 'Which scheme would you like to know about? For example, PM-KISAN, Ayushman Bharat, or Ujjwala Yojana?',
        schemeNotFound: (name) => `Sorry, information about "${name}" scheme is not available right now. You can ask about PM-KISAN, Ayushman Bharat, or Ujjwala.`,
        eligibilityPrefix: (schemeName) => `For ${schemeName}:`,
        eligibilitySuffix: 'Would you like more details?',
        documentsPrefix: (schemeName) => `Documents required for ${schemeName}:`,
        applyPrefix: (schemeName) => `To apply for ${schemeName}:`
    },
    'ta-IN': {
        askWhichScheme: 'Enna thittam pathi therinja kollanumnu ninaikkireenga? Udaaranathukku PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
        schemeNotFound: (name) => `Mannikkavum, "${name}" thittam pathi thagaval ippo kidaiyaadhu. PM-KISAN, Ayushman Bharat, Ujjwala pathi kekkalam.`,
        eligibilityPrefix: (schemeName) => `${schemeName} thaguthigal:`,
        eligibilitySuffix: 'Innum thagaval veenuma?',
        documentsPrefix: (schemeName) => `${schemeName}-kku thevaiyana aaavanam:`,
        applyPrefix: (schemeName) => `${schemeName} apply panna:`
    },
    'te-IN': {
        askWhichScheme: 'Mee evari padakam gurinchi telusukovaalanukuntunaaru? Udaaharanaku PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
        schemeNotFound: (name) => `Kshaminchandi, "${name}" padakam gurinchi samacharam ippudu andubatulo ledu. PM-KISAN, Ayushman Bharat, Ujjwala gurinchi adagachu.`,
        eligibilityPrefix: (schemeName) => `${schemeName} arhata:`,
        eligibilitySuffix: 'Inka viveramulu kaavala?',
        documentsPrefix: (schemeName) => `${schemeName} kosam kaavalsina documents:`,
        applyPrefix: (schemeName) => `${schemeName} apply cheyyadaaniki:`
    },
    'bn-IN': {
        askWhichScheme: 'Aapni kon projokti somporke jante chaichen? Jemon PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
        schemeNotFound: (name) => `Dukkhito, "${name}" projokti somporke tothyo ekhon paowa jachhe na. PM-KISAN, Ayushman Bharat, ba Ujjwala somporke jigges korte paren.`,
        eligibilityPrefix: (schemeName) => `${schemeName}-er yogyota:`,
        eligibilitySuffix: 'Aro tothyo chai?',
        documentsPrefix: (schemeName) => `${schemeName}-er jonno dorkari kagojpotro:`,
        applyPrefix: (schemeName) => `${schemeName} abedon korte:`
    },
    'mr-IN': {
        askWhichScheme: 'Tumhala kontya yojane baddal mahiti havi aahe? Udaaharnaarth PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
        schemeNotFound: (name) => `Maaf kara, "${name}" yojane baddal mahiti sadhya uplabdh nahi. PM-KISAN, Ayushman Bharat, kinva Ujjwala baddal vicharu shakta.`,
        eligibilityPrefix: (schemeName) => `${schemeName} sathi pathrata:`,
        eligibilitySuffix: 'Aanakhi mahiti havi ka?',
        documentsPrefix: (schemeName) => `${schemeName} sathi lagnare kagadpatre:`,
        applyPrefix: (schemeName) => `${schemeName} sathi arj karnyasathi:`
    }
};

function getTemplate(language) {
    return TEMPLATES[language] || TEMPLATES['hi-IN'];
}

/**
 * Handle a government scheme query
 * Called when Bedrock detects intent: govt_scheme_info or govt_scheme_eligibility
 */
export async function handleGovtScheme(intent, entities, session) {
    const schemeName = entities?.scheme_name;
    const queryType = entities?.query_type || 'info';
    const language = session?.language || 'hi-IN';
    const t = getTemplate(language);

    if (!schemeName) {
        return {
            response_text: t.askWhichScheme,
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Resolve scheme ID
    const schemeId = resolveSchemeId(schemeName);
    const scheme = schemeId ? await getSchemeDetails(schemeId) : null;

    if (!scheme) {
        return {
            response_text: t.schemeNotFound(schemeName),
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Handle different query types with language awareness
    switch (queryType) {
        case 'eligibility':
            return handleEligibility(scheme, language, t);

        case 'documents':
            return handleDocuments(scheme, language, t);

        case 'how_to_apply':
            return handleHowToApply(scheme, language, t);

        case 'benefits':
        case 'info':
        default:
            return handleSchemeInfo(scheme, language, t);
    }
}

/**
 * Pick the right text based on language — use Hindi for Hindi, English for all others
 * (Scheme data only has Hindi + English fields)
 */
function pickText(hindiText, englishText, language) {
    if (language === 'hi-IN') return hindiText || englishText;
    // For non-Hindi languages, use English text — Claude will translate in the system prompt
    return englishText || hindiText;
}

function handleSchemeInfo(scheme, language, t) {
    const summary = pickText(scheme.hindi_summary, scheme.benefit, language);
    const helpline = scheme.helpline ? ` Helpline: ${scheme.helpline}` : '';
    return {
        response_text: `${summary}${helpline}`,
        sms_content: `${scheme.name}: ${scheme.benefit}\nHelpline: ${scheme.helpline}\nWebsite: ${scheme.website}`,
        next_state: 'listening'
    };
}

function handleEligibility(scheme, language, t) {
    const criteria = pickText(
        scheme.eligibility?.description_hindi,
        scheme.eligibility?.description,
        language
    );
    return {
        response_text: `${t.eligibilityPrefix(scheme.name)} ${criteria}. ${t.eligibilitySuffix}`,
        sms_content: null,
        next_state: 'listening'
    };
}

function handleDocuments(scheme, language, t) {
    const docs = scheme.documents_required?.join(', ') || '';
    return {
        response_text: `${t.documentsPrefix(scheme.name)} ${docs}`,
        sms_content: `${scheme.name} - Required Documents:\n${scheme.documents_required?.map((d, i) => `${i + 1}. ${d}`).join('\n')}`,
        next_state: 'listening'
    };
}

function handleHowToApply(scheme, language, t) {
    const steps = pickText(
        scheme.how_to_apply?.steps_hindi?.slice(0, 3).join('. '),
        scheme.how_to_apply?.steps?.slice(0, 3).join('. '),
        language
    );
    return {
        response_text: `${t.applyPrefix(scheme.name)} ${steps}`,
        sms_content: `${scheme.name} - How to Apply:\n${scheme.how_to_apply?.steps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nHelpline: ${scheme.helpline}`,
        next_state: 'listening'
    };
}

/**
 * Resolve a scheme name (possibly Hindi/colloquial) to a scheme ID
 */
function resolveSchemeId(name) {
    if (!name) return null;

    const normalized = name.toLowerCase().trim()
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ');

    // Direct match
    if (SCHEME_ALIASES[normalized]) return SCHEME_ALIASES[normalized];

    // Partial match
    for (const [alias, id] of Object.entries(SCHEME_ALIASES)) {
        if (normalized.includes(alias) || alias.includes(normalized)) {
            return id;
        }
    }

    // Try the name as-is (it might already be a scheme ID)
    return normalized.replace(/\s+/g, '_');
}
