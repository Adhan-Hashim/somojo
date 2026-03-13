const aiService = require('./aiService'); // We will augment this or use a new one, but let's build it here first.

// Let's create a dedicated locationService for clarity
const { GoogleGenAI } = require('@google/genai');

// Setup Gemini (automatically picks up GEMINI_API_KEY)
const ai = new GoogleGenAI({});

/**
 * Uses Gemini AI to intelligently parse a vague location string 
 * and return a best-guess [longitude, latitude] GeoJSON coordinate pair.
 * In a production scenario with Google Maps API enabled, you would use 
 * the Geocoding API first, and fallback to this AI method.
 * 
 * @param {string} locationString - e.g. "NYC", "San Francisco Bay Area", "Remote - Texas"
 * @returns {Promise<[number, number] | null>} - [longitude, latitude] or null if invalid
 */
exports.geocodeLocationWithAI = async (locationString) => {
    if (!locationString || locationString.toLowerCase().includes('remote')) {
        // Handle remote or empty by returning null or a default
        // Could technically point 'remote' to [0,0] but null is safer for 'no specific physical location'
        return null;
    }

    const prompt = `
        You are a highly accurate geolocation service. 
        Convert the following location string into a precise longitude and latitude coordinate pair.
        Respond ONLY with a valid JSON array of two numbers: [longitude, latitude].
        Do not include any other text, markdown formatting, or explanations.
        If the location is entirely fictitious or impossible to locate, respond with null.
        
        Location string: "${locationString}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const text = response.text().trim();

        // Strip out potential markdown code blocks if the AI disobeyed
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        if (cleanedText === 'null') return null;

        const coords = JSON.parse(cleanedText);

        if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            return coords; // Return [lng, lat]
        }

        return null;
    } catch (err) {
        console.error("[LocationService] AI Geocoding failed:", err);
        return null;
    }
};
