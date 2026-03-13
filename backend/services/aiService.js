const { GoogleGenAI } = require('@google/genai');

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from the environment
const ai = new GoogleGenAI({});

/**
 * Evaluates a candidate's profile against a job description.
 * 
 * @param {Object} profileData - The candidate's profile data (skills, experience, education, etc.)
 * @param {Object} jobData - The job posting data (description, requirements, title, etc.)
 * @returns {Promise<{score: number, reasoning: string}>} - The calculated fit score and a 1-2 sentence explanation.
 */
const evaluateCandidate = async (profileData, jobData) => {
    try {
        const prompt = `
        You are an expert technical recruiter and ATS (Applicant Tracking System) AI.
        Your task is to evaluate a candidate's profile against a job posting and return a JSON match score.
        
        Job Posting:
        Title: ${jobData.title}
        Company: ${jobData.company}
        Description: ${jobData.description}
        Requirements: ${jobData.requirements?.join(', ') || 'None specified'}
        
        Candidate Profile:
        Headline: ${profileData.headline || 'None'}
        Bio: ${profileData.bio || 'None'}
        Skills: ${profileData.skills?.join(', ') || 'None specified'}
        Experience: ${JSON.stringify(profileData.experience || [])}
        Education: ${JSON.stringify(profileData.education || [])}
        
        Analyze the fit. Return EXACTLY one valid JSON object with the following schema:
        {
            "score": <number between 0 and 100 indicating percentage match>,
            "reasoning": "<string containing a 1-2 sentence explanation of why this score was given, focusing on matching skills/experience>"
        }
        
        Do not include any formatting like \`\`\`json. Return ONLY the raw JSON object.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        });

        const jsonText = response.text();
        const result = JSON.parse(jsonText);

        return {
            score: result.score || 0,
            reasoning: result.reasoning || "Failed to generate reasoning."
        };
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        // Fallback gracefully so the application process doesn't completely fail
        return {
            score: 0,
            reasoning: "AI evaluation unavailable at this time."
        };
    }
};

/**
 * Recommends jobs to a candidate based on their profile.
 * 
 * @param {Object} profileData - The candidate's profile data
 * @param {Array<Object>} jobsList - A list of available jobs to rank
 * @returns {Promise<Array<Object>>} - The list of jobs sorted by match score
 */
const rankJobsForCandidate = async (profileData, jobsList) => {
    try {
        // Prepare a minimized version of the jobs to save token context window
        const minJobs = jobsList.map(j => ({
            id: j._id,
            title: j.title,
            description: j.description.substring(0, 500), // truncate for length
            requirements: j.requirements
        }));

        const prompt = `
        You are an expert job recommendation engine.
        
        Candidate Profile:
        Headline: ${profileData.headline || 'None'}
        Skills: ${profileData.skills?.join(', ') || 'None'}
        Experience: ${JSON.stringify(profileData.experience?.map(e => e.title) || [])}
        
        Available Jobs:
        ${JSON.stringify(minJobs)}
        
        Evaluate the candidate against EVERY job in the list.
        Return EXACTLY one valid JSON object containing an array called "rankings" with the following schema:
        {
            "rankings": [
                {
                    "jobId": "<string id of the job>",
                    "score": <number 0-100 indicating fit>
                }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1
            }
        });

        const result = JSON.parse(response.text());

        // Map scores back to original objects and sort
        const rankedJobs = jobsList.map(job => {
            const rankInfo = result.rankings?.find(r => r.jobId === job._id.toString());
            return {
                ...job.toObject ? job.toObject() : job, // handle mongoose docs vs plain objects
                aiMatchScore: rankInfo ? rankInfo.score : 0
            };
        });

        // Sort descending by score
        return rankedJobs.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    } catch (error) {
        console.error("AI Ranking Error:", error);
        return jobsList; // Fallback to unsorted
    }
}

/**
 * Searches and ranks candidate profiles based on a natural language query.
 * 
 * @param {string} searchQuery - The employer's natural language search prompt
 * @param {Array<Object>} profilesList - A list of available candidate profiles
 * @returns {Promise<Array<Object>>} - The list of profiles sorted by match score
 */
const searchProfilesWithAI = async (searchQuery, profilesList) => {
    try {
        // Prevent exceeding context limits by minimizing the profile data sent
        const minProfiles = profilesList.map(p => ({
            id: p.user._id, // we'll use the user ID to map back
            name: p.user.name,
            headline: p.headline,
            location: p.location,
            skills: p.skills,
            experience: p.experience?.map(e => `${e.title} at ${e.company} (${e.description?.substring(0, 100)}...)`) || []
        }));

        const prompt = `
        You are an expert technical recruiter AI.
        
        Employer's Search Query: "${searchQuery}"
        
        Available Candidate Profiles:
        ${JSON.stringify(minProfiles)}
        
        Evaluate EVERY candidate in the list against the employer's search query. Look for semantic matches, not just exact keywords.
        Return EXACTLY one valid JSON object containing an array called "results" with the following schema:
        {
            "results": [
                {
                    "userId": "<string id of the user>",
                    "score": <number 0-100 indicating fit>,
                    "reason": "<string 1-2 sentences explaining why they are a fit or not a fit for this specific query>"
                }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        });

        const result = JSON.parse(response.text());

        // Map scores back to original profile objects and sort
        const rankedProfiles = profilesList.map(profile => {
            const rankInfo = result.results?.find(r => r.userId === profile.user._id.toString());
            return {
                ...profile.toObject ? profile.toObject() : profile,
                aiMatchScore: rankInfo ? rankInfo.score : 0,
                aiMatchReason: rankInfo ? rankInfo.reason : "No AI analysis provided."
            };
        });

        // Filter out profiles below a certain threshold (optional, but good for UX) and sort descending
        return rankedProfiles
            .filter(p => p.aiMatchScore >= 20) // Only return somewhat relevant profiles
            .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    } catch (error) {
        console.error("AI Semantic Search Error:", error);
        return [];
    }
}

/**
 * Generates an employer branding profile.
 * 
 * @param {string} companyName - The name of the company
 * @param {string} companyDescription - A brief sentence describing the company
 * @returns {Promise<Object>} - The generated branding data
 */
const generateEmployerBranding = async (companyName, companyDescription) => {
    try {
        const prompt = `
        You are an expert employer branding consultant and copywriter.
        
        Company Name: ${companyName}
        Short Description: ${companyDescription}
        
        Your task is to generate a comprehensive, attractive, and professional Employer Branding profile to attract top tech/retail talent.
        Return EXACTLY one valid JSON object with the following schema:
        {
            "manifesto": "<string containing a 2-3 paragraph 'Company Culture Manifesto'>",
            "whyJoinUs": "<string containing a compelling 1 paragraph pitch on why someone should work here>",
            "testimonials": [
                {
                    "quote": "<synthetic realistic 1-2 sentence employee testimonial>",
                    "author": "<synthetic realistic name>",
                    "role": "<synthetic realistic job title>"
                }
            ] // Create exactly 3 diverse robust synthetic testimonials that align with the company description
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7 // higher creativity
            }
        });

        const result = JSON.parse(response.text());
        return {
            manifesto: result.manifesto || "",
            whyJoinUs: result.whyJoinUs || "",
            testimonials: result.testimonials || []
        };
    } catch (error) {
        console.error("AI Employer Branding Error:", error);
        return {
            manifesto: "Failed to generate brand manifesto. Keep exploring to build your brand.",
            whyJoinUs: "Join us to build something great.",
            testimonials: []
        };
    }
}

/**
 * Enhances a basic job description into a highly engaging, professional posting.
 * 
 * @param {Object} jobDetails - Basic job info (title, company, description)
 * @returns {Promise<string>} - The enhanced job description in markdown
 */
const enhanceJobDescription = async (jobDetails) => {
    try {
        const prompt = `
        You are an expert technical recruiter and copywriter.
        An employer has provided a basic job description. Your task is to rewrite and optimize it to attract top talent.
        Make it engaging, professional, well-structured, and use relevant emojis.
        
        Job Title: ${jobDetails.title || 'Not specified'}
        Company: ${jobDetails.company || 'Not specified'}
        Basic Description/Draft: ${jobDetails.description || 'Not specified'}
        
        Return ONLY the rewritten, enhanced job description in clean Markdown format. 
        Do not include any conversational filler (like "Here is the rewritten description:").
        Structure it with an engaging intro, bolded responsibilities, and requirements.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.6
            }
        });

        return response.text().trim();
    } catch (error) {
        console.error("AI Job Enhancement Error:", error);
        return jobDetails.description || "Failed to enhance job description.";
    }
}

/**
 * Conducts a screening interview by acting as a chatbot.
 * 
 * @param {Array<Object>} messages - Array of past messages {role: 'user'|'model', parts: [{text: '...'}]}
 * @param {string} company - Company the interview is for
 * @param {string} jobRole - The position
 * @returns {Promise<string>} - The AI's next response
 */
const conductInterview = async (messages, company = "our company", jobRole = "the open position") => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are an expert HR recruiter conducting a preliminary phone screen on behalf of ${company} for the role of ${jobRole}. 
                Your goal is to ask 3 to 4 behavioral and experience-related questions one at a time.
                Be friendly, welcoming, professional, and do not ask all questions at once. 
                After 4 back-and-forths, conclude the interview politely.`,
                temperature: 0.5
            },
            history: messages.slice(0, -1) // Provide previous history
        });

        // Pass the latest message to generate the next response
        const latestMessage = messages[messages.length - 1];
        const response = await chat.sendMessage({ text: latestMessage.parts[0].text });

        return response.text();
    } catch (error) {
        console.error("AI Interview Error:", error);
        return "I'm having a little trouble connecting right now. Could you please repeat that?";
    }
}

module.exports = {
    evaluateCandidate,
    rankJobsForCandidate,
    searchProfilesWithAI,
    generateEmployerBranding,
    enhanceJobDescription,
    conductInterview
};
