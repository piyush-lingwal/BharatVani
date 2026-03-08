/**
 * BharatVani — Government Schemes Handler
 * Handles scheme info, eligibility, and how-to-apply queries
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
    'umang': 'digital_india',
    'eshram': 'eshram',
    'e shram': 'eshram',
    'shram card': 'eshram',
    'mazdoor card': 'eshram',
    'ration': 'food_security',
    'ration card': 'food_security',
    'food security': 'food_security',
    'sasta anaj': 'food_security',
    'jal jeevan': 'jal_jeevan',
    'har ghar jal': 'jal_jeevan',
    'paani connection': 'jal_jeevan',
    'tap water': 'jal_jeevan',
    'scholarship': 'national_scholarship',
    'chhaatravritti': 'national_scholarship',
    'padhai ka paisa': 'national_scholarship',
    'jeevan jyoti': 'pm_jeevan_jyoti',
    'jeevan bima': 'pm_jeevan_jyoti',
    'life insurance': 'pm_jeevan_jyoti',
    'matru vandana': 'pm_matru_vandana',
    'maternity': 'pm_matru_vandana',
    'garbhvati': 'pm_matru_vandana',
    'pregnant': 'pm_matru_vandana',
    'suraksha bima': 'pm_suraksha_bima',
    'accident insurance': 'pm_suraksha_bima',
    'durghatna bima': 'pm_suraksha_bima',
    'svanidhi': 'pm_svanidhi',
    'street vendor': 'pm_svanidhi',
    'thela': 'pm_svanidhi',
    'rehri': 'pm_svanidhi',
    'vishwakarma': 'pm_vishwakarma',
    'karigar': 'pm_vishwakarma',
    'lohar': 'pm_vishwakarma',
    'badhai': 'pm_vishwakarma',
    'kumhar': 'pm_vishwakarma',
    'darzi': 'pm_vishwakarma',
    'skill india': 'skill_india',
    'training': 'skill_india',
    'pmkvy': 'skill_india',
    'kaushal vikas': 'skill_india',
    'standup india': 'standup_india',
    'stand up': 'standup_india',
    'sc st loan': 'standup_india',
    'mahila udyami': 'standup_india',
    'startup india': 'startup_india',
    'startup': 'startup_india',
    'swachh bharat': 'swachh_bharat',
    'shauchalay': 'swachh_bharat',
    'toilet': 'swachh_bharat',
    'safai': 'swachh_bharat'
};

/**
 * Handle a government scheme query
 * Called when Bedrock detects intent: govt_scheme_info or govt_scheme_eligibility
 */
export async function handleGovtScheme(intent, entities, session) {
    const schemeName = entities?.scheme_name;
    const queryType = entities?.query_type || 'info';

    if (!schemeName) {
        return {
            response_text: 'Kaunsi yojana ke baare mein jaanna chahte hain? Jaise PM-KISAN, Ayushman Bharat, Ujjwala Yojana?',
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Resolve scheme ID
    const schemeId = resolveSchemeId(schemeName);
    const scheme = schemeId ? await getSchemeDetails(schemeId) : null;

    if (!scheme) {
        return {
            response_text: `Maaf kijiye, "${schemeName}" yojana ki jaankari abhi available nahi hai. PM-KISAN, Ayushman Bharat, ya Ujjwala ke baare mein pooch sakte hain.`,
            sms_content: null,
            next_state: 'listening'
        };
    }

    // Handle different query types
    switch (queryType) {
        case 'eligibility':
            return handleEligibility(scheme);

        case 'documents':
            return handleDocuments(scheme);

        case 'how_to_apply':
            return handleHowToApply(scheme);

        case 'benefits':
        case 'info':
        default:
            return handleSchemeInfo(scheme);
    }
}

function handleSchemeInfo(scheme) {
    return {
        response_text: scheme.hindi_summary,
        sms_content: `${scheme.name}: ${scheme.benefit}\nHelpline: ${scheme.helpline}\nWebsite: ${scheme.website}`,
        next_state: 'listening'
    };
}

function handleEligibility(scheme) {
    const criteria = scheme.eligibility.description_hindi;
    return {
        response_text: `${scheme.name} ke liye: ${criteria}. Kya aur details chahiye?`,
        sms_content: null,
        next_state: 'listening'
    };
}

function handleDocuments(scheme) {
    const docs = scheme.documents_required.join(', ');
    return {
        response_text: `${scheme.name} ke liye ye documents chahiye: ${docs}`,
        sms_content: `${scheme.name} - Required Documents:\n${scheme.documents_required.map((d, i) => `${i + 1}. ${d}`).join('\n')}`,
        next_state: 'listening'
    };
}

function handleHowToApply(scheme) {
    const steps = scheme.how_to_apply.steps_hindi.slice(0, 3).join('. ');
    return {
        response_text: `${scheme.name} apply karne ke liye: ${steps}`,
        sms_content: `${scheme.name} - How to Apply:\n${scheme.how_to_apply.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nHelpline: ${scheme.helpline}`,
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
