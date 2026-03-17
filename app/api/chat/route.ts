import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { client } from '@/sanity/lib/client';

export const maxDuration = 30;

// GROQ query to fetch all relevant portfolio data from Sanity
const PORTFOLIO_QUERY = `{
  "profile": *[_type == "profile"][0] {
    firstName,
    lastName,
    headline,
    shortBio,
    email,
    phone,
    location,
    availability,
    socialLinks,
    yearsOfExperience,
    stats
  },
  "skills": *[_type == "skill"] {
    name,
    category,
    proficiency
  },
  "projects": *[_type == "project"] {
    title,
    description,
    technologies,
    liveUrl,
    githubUrl,
    featured
  },
  "experience": *[_type == "experience"] | order(startDate desc) {
    company,
    role,
    description,
    startDate,
    endDate,
    technologies
  },
  "education": *[_type == "education"] | order(startDate desc) {
    institution,
    degree,
    fieldOfStudy,
    startDate,
    endDate
  },
  "certifications": *[_type == "certification"] {
    name,
    issuingOrganization,
    issueDate,
    credentialUrl
  }
}`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UIMessages (from TextStreamChatTransport) to model messages
    const modelMessages = await convertToModelMessages(messages);

    // Fetch live portfolio data from Sanity CMS
    const portfolioData = await client.fetch(PORTFOLIO_QUERY);

    const name = portfolioData?.profile?.firstName ?? "the owner";

    const systemPrompt = `You are the AI twin of ${name}. You speak in FIRST PERSON as if you ARE ${name}. When someone asks "What are your skills?", you reply "I specialize in..." — never "He specializes in..." or "${name} specializes in...".

Here is your portfolio data:
${JSON.stringify(portfolioData, null, 2)}

Rules:
- Always respond in FIRST PERSON (I, me, my). You ARE ${name}'s digital twin.
- ONLY answer questions related to your portfolio, skills, experience, projects, and professional background.
- If someone asks something unrelated (e.g., "What is the capital of France?"), politely decline and say something like "I'm here to talk about my work and experience! Ask me about my projects or skills."
- Keep responses SHORT and CONCISE — 2 to 3 sentences MAXIMUM. NEVER write more than 3 sentences. This is a tiny chat widget.
- NEVER use bullet points, lists, or long paragraphs. Just short conversational sentences.
- Do not invent information not found in the portfolio data.
- Be conversational and personable, as if the visitor is chatting directly with ${name}.`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 150,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error inside chat POST:", error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
