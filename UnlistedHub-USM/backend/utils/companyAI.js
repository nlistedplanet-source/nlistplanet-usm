/**
 * Company AI Service
 * OpenAI integration for generating:
 * 1. Investment highlights (4-5 key points)
 * 2. Company description/analysis
 */

import OpenAI from 'openai';

// Lazy initialization for OpenAI
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

/**
 * Generate investment highlights for a company
 * @param {Object} companyData - Company information
 * @returns {Promise<Object>} { highlights: string[], description: string }
 */
export const generateCompanyHighlights = async (companyData) => {
  const openai = getOpenAI();
  if (!openai) {
    console.log('⚠️ OpenAI not configured');
    return { highlights: [], description: '' };
  }

  const { name, scriptName, sector, description } = companyData;
  const companyName = scriptName || name;

  try {
    console.log(`\n🤖 Generating investment highlights for ${companyName}...`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional investment analyst specializing in Indian unlisted companies and pre-IPO opportunities. Your task is to create compelling investment highlights for share trading cards.

Guidelines:
1. Create 4-5 concise, impactful bullet points (each 8-15 words)
2. Focus on: market position, business model, growth potential, competitive advantages
3. Use professional investment language
4. Be factual and balanced (mention both strengths and opportunity)
5. Suitable for social media share cards

Also create a 2-3 sentence investment thesis/description (50-80 words) that explains why this is a compelling opportunity.

Format your response as JSON:
{
  "highlights": ["point 1", "point 2", "point 3", "point 4"],
  "description": "Investment thesis paragraph..."
}`
        },
        {
          role: 'user',
          content: `Generate investment highlights and description for:

Company: ${companyName} (${name})
Sector: ${sector}
${description ? `Current Description: ${description}` : ''}

Please create professional investment highlights and a compelling description for unlisted share trading.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    console.log(`✅ Generated ${result.highlights?.length || 0} highlights for ${companyName}`);
    
    return {
      highlights: result.highlights || [],
      description: result.description || ''
    };

  } catch (error) {
    console.error(`❌ Error generating highlights for ${companyName}:`, error.message);
    
    // Fallback highlights based on sector
    return generateFallbackHighlights(companyData);
  }
};

/**
 * Generate fallback highlights if OpenAI fails
 */
const generateFallbackHighlights = (companyData) => {
  const { name, scriptName, sector } = companyData;
  const companyName = scriptName || name;

  const fallbackHighlights = [
    `Leading player in ${sector} sector`,
    'Pre-IPO investment opportunity',
    'Strong market presence in India',
    'Verified trading on NlistPlanet'
  ];

  const fallbackDescription = `${companyName} is a prominent company in the ${sector} sector, offering investors a unique pre-IPO opportunity. With strong market fundamentals and growth potential, this unlisted share presents an attractive investment avenue for serious investors.`;

  return {
    highlights: fallbackHighlights,
    description: fallbackDescription
  };
};

/**
 * Batch generate highlights for multiple companies
 * @param {Array} companies - Array of company objects
 * @param {number} delayMs - Delay between API calls (default 2000ms)
 */
export const batchGenerateHighlights = async (companies, delayMs = 2000) => {
  const results = [];
  
  for (const company of companies) {
    try {
      const generated = await generateCompanyHighlights(company);
      results.push({
        companyId: company._id,
        name: company.name,
        success: true,
        ...generated
      });
      
      // Delay to avoid rate limiting
      if (companies.indexOf(company) < companies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({
        companyId: company._id,
        name: company.name,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

export default {
  generateCompanyHighlights,
  batchGenerateHighlights
};
