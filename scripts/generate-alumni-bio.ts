#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const OPENAI_API_KEY = process.env.OPEN_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

function getArgFlag(name: string): boolean {
  return process.argv.includes(name);
}

function getArgValue(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return undefined;
}

function shouldUseSearch(): boolean {
  if (getArgFlag('--no-search')) return false;
  if (getArgFlag('--use-search')) return true;
  // Default: use search when PERPLEXITY_API_KEY is present
  return Boolean(PERPLEXITY_API_KEY);
}

function shouldUseOptimizedSearch(): boolean {
  if (getArgFlag('--no-opt-search')) return false;
  if (getArgFlag('--opt-search')) return true;
  // Default: try optimized search if Sanity + OpenAI keys exist
  return Boolean(OPENAI_API_KEY);
}

type SanityPerson = {
  _id: string;
  name: string;
  slug?: { current: string };
  title?: string;
  userGroup?: string;
  website?: string;
  socialMedia?: {
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  education?: Array<{ degree?: string; field?: string; institution?: string; year?: number }>;
  researchInterests?: string[];
  bio?: string;
  bioLong?: string;
  currentPosition?: string;
  joinDate?: string;
  leaveDate?: string;
};

async function fetchSanityPersonByName(personName: string): Promise<SanityPerson | null> {
  try {
    const mod: any = await import('../src/lib/cms/client');
    const q = `*[_type == "person" && lower(name) == lower($name)][0]{
      _id, name, slug, title, userGroup, website, socialMedia, education, researchInterests,
      bio, bioLong, currentPosition, joinDate, leaveDate
    }`;
    const person = await mod.client.fetch(q, { name: personName });
    return person || null;
  } catch (err: any) {
    console.error('(info) Sanity lookup unavailable:', err?.message || err);
    return null;
  }
}

function buildPersonContextForSearch(person: SanityPerson | null, personName: string): string {
  if (!person) return `Name: ${personName}`;
  const lines: string[] = [];
  lines.push(`Name: ${person.name}`);
  if (person.title) lines.push(`Lab title: ${person.title}`);
  if (person.currentPosition) lines.push(`Recorded current position: ${person.currentPosition}`);
  if (person.researchInterests?.length)
    lines.push(`Interests: ${person.researchInterests.join(', ')}`);
  if (person.website) lines.push(`Website: ${person.website}`);
  const sm = person.socialMedia || {};
  const smLines = [
    sm.linkedin ? `LinkedIn: ${sm.linkedin}` : undefined,
    sm.googleScholar ? `Google Scholar: ${sm.googleScholar}` : undefined,
    sm.orcid ? `ORCID: ${sm.orcid}` : undefined,
    sm.twitter ? `Twitter: ${sm.twitter}` : undefined,
    sm.github ? `GitHub: ${sm.github}` : undefined,
    sm.researchGate ? `ResearchGate: ${sm.researchGate}` : undefined,
  ].filter(Boolean) as string[];
  if (smLines.length) lines.push(smLines.join(' | '));
  if (person.education?.length) {
    const ed = person.education
      .slice(0, 3)
      .map((e) => [e.degree, e.field, e.institution, e.year].filter(Boolean).join(' '))
      .join(' ; ');
    if (ed) lines.push(`Education: ${ed}`);
  }
  if (person.bio) lines.push(`Bio: ${person.bio.slice(0, 300)}`);
  if (person.bioLong) lines.push(`BioLong: ${person.bioLong.slice(0, 400)}`);
  return lines.join('\n');
}

async function generateOptimizedSearchQuery(
  personName: string,
  context: string,
  extraContext?: string,
): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const optModel = process.env.OPENAI_MODEL || 'gpt-4.1';
    const body: any = {
      model: optModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You craft a single high-precision web search query to disambiguate a person and find their CURRENT role. Return ONLY JSON: {"query":"..."}. Use the exact full name in quotes, add any unique identifiers (affiliations, degrees, URLs, ORCID, LinkedIn handles), and include role keywords (e.g., CEO, Assistant Professor). Prefer recent/current signals. Keep it concise and effective.',
        },
        {
          role: 'user',
          content:
            `Full name: ${personName}\nKnown profile data (may be partial or outdated):\n${context}` +
            (extraContext ? `\nAdditional disambiguation context: ${extraContext}` : ''),
        },
      ],
    };
    if (!optModel.toLowerCase().startsWith('gpt-5')) {
      body.temperature = 0.2;
    }
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error(`(warn) optimized query gen failed ${resp.status}: ${txt}`);
      return null;
    }
    const json: any = await resp.json();
    const content = json?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');
    const q = typeof parsed.query === 'string' ? parsed.query.trim() : '';
    return q || null;
  } catch (err: any) {
    console.error('(warn) optimized query gen error:', err?.message || err);
    return null;
  }
}

async function runPerplexitySearch(
  personName: string,
  optimizedQuery?: string,
  extraContext?: string,
): Promise<string | undefined> {
  if (!PERPLEXITY_API_KEY) return undefined;

  const baseQuery = `Find the CURRENT position (active job title and institution/employer) for ${personName}. Summarize recent sources (prefer official pages, recent profiles, or press) and include role, institution, and any recent title changes. Provide a concise factual bullet summary with inline source URLs.`;
  const query = optimizedQuery
    ? `${optimizedQuery}${extraContext ? ` ${extraContext}` : ''}\n\nTask: ${baseQuery}`
    : `${extraContext ? `${personName} ${extraContext}. ` : ''}${baseQuery}`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'You are a web research assistant. Be concise and cite links inline.',
          },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error(`(warn) Perplexity error ${response.status}: ${txt}`);
      return undefined;
    }
    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return undefined;
    return content;
  } catch (err: any) {
    console.error(`(warn) Perplexity request failed: ${err?.message || err}`);
    return undefined;
  }
}

async function fetchAlumniBio(
  personName: string,
): Promise<{ current_position: string; description: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPEN_API_KEY is not set in .env.local');
  }

  const systemPrompt = [
    'You generate concise, factual alumni bios for a research lab website.',
    'Return ONLY strict JSON with exactly two keys: current_position and description.',
    'STRICT: current_position MUST start with "{NAME} is" and include " at " to name the institution/employer.',
    'FOCUS: Use the CURRENT position (present employment/role) only. Ignore past roles unless they are the current role.',
    'If multiple roles exist, choose the primary or most senior current role; prefer academic appointments when relevant.',
    'If reliable current information cannot be found, return empty strings for both values.',
    "STYLE: Avoid gendered pronouns (he, she, his, her, Mr., Ms.). Prefer repeating the person's name or use neutral phrasing. Keep description to a single sentence.",
    'No extra keys, no markdown, no commentary, no citations.',
  ].join(' ');

  const userPrompt = [
    `Give me the CURRENT position (job title and institution) and a 1-sentence bio for ${personName} to update their alumni listing in my lab group's website.`,
    'Return JSON with two entries: current_position and description.',
    `Ensure current_position begins with "${personName} is ... at ..." using the provided name and only present-day information.`,
    'Write the description without gendered pronouns; repeat the name or use neutral phrasing as needed.',
  ].join(' ');

  // Model selection: default to GPT-5, with optional reasoning mode and fallbacks
  const explicitModel = getArgValue('--model') || process.env.OPENAI_MODEL;
  const useReasoning = getArgFlag('--reasoning');

  const reasoningPreferred = useReasoning
    ? ([
        explicitModel,
        'gpt-5-reasoning',
        'o4-mini',
        'o3',
        'gpt-5',
        'gpt-4.1',
        'gpt-4o',
        'gpt-4o-mini',
      ].filter(Boolean) as string[])
    : ([explicitModel, 'gpt-5', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini'].filter(Boolean) as string[]);

  const supportsReasoning = (model: string): boolean => {
    const m = model.toLowerCase();
    return (
      m.includes('gpt-5-reasoning') ||
      m === 'o3' ||
      m.startsWith('o3-') ||
      m === 'o4' ||
      m.startsWith('o4-')
    );
  };

  let lastError: any;
  let content: string | undefined;
  let usedModel: string | undefined;

  // Optionally fetch search context first
  let searchContext: string | undefined;
  let optimizedQuery: string | undefined;
  const extraContext = getArgValue('--context');
  if (shouldUseSearch()) {
    if (shouldUseOptimizedSearch()) {
      const sanityPerson = await fetchSanityPersonByName(personName);
      const context = buildPersonContextForSearch(sanityPerson, personName);
      optimizedQuery =
        (await generateOptimizedSearchQuery(personName, context, extraContext || undefined)) ??
        undefined;
      if (optimizedQuery) console.error('(info) optimized search query generated');
    }
    searchContext = await runPerplexitySearch(
      personName,
      optimizedQuery,
      extraContext || undefined,
    );
    if (searchContext) {
      console.error('(info) web search: enabled (Perplexity)');
    } else {
      console.error('(info) web search: attempted but no results');
    }
  } else {
    console.error('(info) web search: disabled');
  }

  for (const candidate of reasoningPreferred) {
    try {
      // Construct messages once per attempt
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt.replace('{NAME}', personName) },
        // Few-shot to steer exact style
        {
          role: 'user',
          content:
            "Give me the current position and a 1-sentence bio I can use for Cascade Tuholske to update his alumni listing in my lab group's website. Your response should be in JSON, with two entries: current_position and description",
        },
        {
          role: 'assistant',
          content:
            '{"current_position":"Cascade Tuholske is an Assistant Professor of Human–Environment Geography at Montana State University","description":"Cascade Tuholske is an Assistant Professor of Human–Environment Geography at Montana State University, whose research spans climate change, urbanization, and food security—with a particular focus on urban extreme heat exposure and its implications for vulnerable populations."}',
        },
      ];

      if (searchContext) {
        messages.push({
          role: 'system',
          content:
            `Web findings for ${personName} (use to determine CURRENT role; prioritize most recent/official):\n` +
            truncateForContext(searchContext, 6000),
        });
      }

      messages.push({ role: 'user', content: userPrompt });

      const body: any = {
        model: candidate,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages,
      };

      if (useReasoning && supportsReasoning(candidate)) {
        body.reasoning = { effort: 'medium' };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `OpenAI API error (${response.status}) for model ${candidate}: ${errorBody}`,
        );
      }

      const json = (await response.json()) as any;
      const maybeContent = json?.choices?.[0]?.message?.content;
      if (typeof maybeContent !== 'string') {
        throw new Error(`Unexpected response format for model ${candidate}`);
      }
      content = maybeContent;
      usedModel = candidate;
      break; // success
    } catch (err) {
      lastError = err;
      continue; // try next model
    }
  }

  if (!content) {
    throw new Error(lastError?.message || 'Failed to generate bio with available models');
  }

  // stderr: which model was used (stdout remains pure JSON)
  if (usedModel) {
    console.error(`(info) model used: ${usedModel}${useReasoning ? ' [reasoning]' : ''}`);
  }

  if (typeof content !== 'string') {
    throw new Error('Unexpected OpenAI response format');
  }

  // Parse and normalize to ensure strict JSON output
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Fallback: attempt to extract JSON substring
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return valid JSON');
    parsed = JSON.parse(match[0]);
  }

  const current_position =
    typeof parsed.current_position === 'string' ? parsed.current_position.trim() : '';
  const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';

  return { current_position, description };
}

function truncateForContext(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n... [truncated]';
}

async function main() {
  const argv = process.argv.slice(2);
  const flagsWithValues = new Set(['--model']);
  const knownFlags = new Set([
    '--use-search',
    '--no-search',
    '--opt-search',
    '--no-opt-search',
    '--reasoning',
    '--model',
    '--context',
  ]);
  const nameParts: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (knownFlags.has(token)) {
      if (token === '--context' || flagsWithValues.has(token)) i++; // skip next value
      continue;
    }
    nameParts.push(token);
  }
  const personName = nameParts.join(' ').trim();
  if (!personName) {
    console.error('Usage: npm run bio:generate -- "Full Name"');
    process.exit(1);
  }

  try {
    const result = await fetchAlumniBio(personName);
    // Only output the JSON object to stdout
    process.stdout.write(JSON.stringify(result));
    process.stdout.write('\n');
  } catch (err: any) {
    console.error(err?.message || err);
    process.exit(1);
  }
}

main();
