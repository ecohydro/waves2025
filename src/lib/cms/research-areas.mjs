/**
 * Shared vocabulary and inference for publication research-area (theme) tags.
 *
 * `researchAreas` on a publication document is what drives the theme filter on
 * /publications and the publication lists on /research/ecohydrology, /research/sensors
 * and /research/cnh. Kelly's CV (csv_files/CV/Publications-Table*.csv, Area column)
 * is the source of truth for peer-reviewed work; everything else is inferred here
 * and confirmed by hand.
 *
 * Keep CANONICAL_AREAS in sync with the researchAreas option list in
 * src/sanity/schemaTypes/publication.ts and the area filter in
 * src/app/publications/page.tsx.
 */

export const ECOHYDROLOGY = 'Ecohydrology';
export const SENSORS = 'Sensors';
export const CNH = 'Coupled Natural-Human Systems';
export const MISC = 'Misc';

export const CANONICAL_AREAS = [ECOHYDROLOGY, SENSORS, CNH, MISC];

/**
 * How each area is shown to visitors. The stored value stays 'Sensors' so the CV
 * column, the /research/sensors URL, and every existing document keep working;
 * only the label changes. Change a label here and it changes everywhere it is
 * rendered.
 */
export const AREA_LABELS = {
  [ECOHYDROLOGY]: 'Ecohydrology',
  [SENSORS]: 'Environmental Sensing',
  [CNH]: 'Coupled Natural-Human Systems',
  [MISC]: 'Misc',
};

/** Display label for a stored area value. Unknown values pass through unchanged. */
export function areaLabel(area) {
  return AREA_LABELS[area] || area;
}

/**
 * Every spelling that appears in the CV, in legacy CMS data, or in a plausible
 * hand entry, mapped onto the controlled list. Anything absent from this table is
 * reported as an unknown value rather than silently written.
 */
export const AREA_ALIASES = {
  'ecohydrology': ECOHYDROLOGY,
  'ecohydro': ECOHYDROLOGY,
  'sensors': SENSORS,
  'sensor': SENSORS,
  'environmental sensing': SENSORS,
  // Satellite soil-moisture and land-cover validation work belongs with the sensing theme.
  'remote sensing': SENSORS,
  'cnh': CNH,
  'coupled natural-human systems': CNH,
  'coupled natural human systems': CNH,
  'misc': MISC,
  'miscellaneous': MISC,
  'other': MISC,
  // Discipline-level commentary rather than one of the three research themes.
  'ecology': MISC,
};

/**
 * Splits a CV Area cell (e.g. "Ecohydrology, Sensors") into canonical areas.
 * @param {string | null | undefined} raw
 * @returns {{ areas: string[], unknown: string[] }}
 */
export function mapAreas(raw) {
  if (!raw) return { areas: [], unknown: [] };
  const areas = [];
  const unknown = [];
  for (const piece of String(raw).split(/[,;/]/)) {
    const t = piece.trim();
    if (!t) continue;
    const mapped = AREA_ALIASES[t.toLowerCase()];
    if (mapped) {
      if (!areas.includes(mapped)) areas.push(mapped);
    } else if (!unknown.includes(t)) {
      unknown.push(t);
    }
  }
  return { areas, unknown };
}

/** Orders a set of areas the way the site presents them. */
export function orderAreas(areas) {
  const seen = [...new Set(areas.filter(Boolean))];
  return CANONICAL_AREAS.filter((a) => seen.includes(a)).concat(
    seen.filter((a) => !CANONICAL_AREAS.includes(a)),
  );
}

/* -------------------------------------------------------------------------- */
/* Inference                                                                  */
/* -------------------------------------------------------------------------- */

/** Term lists are weighted: a title hit counts double a body hit. */
const SIGNALS = {
  [ECOHYDROLOGY]: [
    'ecohydrolog', 'evapotranspiration', 'transpiration', 'sap flow', 'soil moisture',
    'soil water', 'water use', 'water stress', 'water-use', 'plant water', 'root zone',
    'coarse root', 'root distribution', 'canopy', 'stomatal', 'xylem', 'hydraulic',
    'drought', 'savanna', 'dryland', 'semi-arid', 'semiarid', 'kalahari', 'vegetation pattern',
    'vegetation dynamics', 'water balance', 'infiltration', 'isotope', 'isotopic',
    'water vapor', 'riparian', 'streamflow', 'catchment', 'hydrolog', 'rainfall', 'precipitation',
    'phenolog', 'leaf water', 'grass productivity', 'carbon flux', 'co2 flux', 'fluxnet',
  ],
  [SENSORS]: [
    'sensor', 'low-cost', 'low cost', 'instrument', 'calibration', 'spectrometer',
    'spectroscopy', 'cavity output', 'crds', 'unmanned aerial', 'uav', 'uas', 'drone',
    'remote sensing', 'satellite', 'imagery', 'landsat', 'sentinel', 'modis', 'smap',
    'ground penetrating radar', 'resistivity', 'monitoring network', 'internet of things',
    'wireless', 'cellular', 'gsm', 'sms', 'mobile phone', 'crowdsourc', 'crowd-sourc',
    'active learning', 'machine learning', 'convolutional', 'computer vision', 'classification accuracy',
    'land cover map', 'landcover', 'backscatter', 'telemetry', 'data logger',
  ],
  [CNH]: [
    'smallholder', 'farmer', 'farming', 'household', 'agricultur', 'cropland', 'crop yield',
    'irrigation', 'food security', 'food system', 'livelihood', 'governance', 'gender',
    'policy', 'institution', 'market', 'poverty', 'adoption', 'decision-making', 'decision making',
    'community', 'water committee', 'water user', 'land use', 'land-use', 'deforestation',
    'urban', 'population', 'migration', 'kenya', 'zambia', 'tanzania', 'ghana', 'malawi',
    'sub-saharan', 'subsistence', 'survey', 'social-environmental', 'socio-environmental',
    'virtual water', 'conservation', 'resilience',
  ],
  [MISC]: [
    'reviewers', 'editorial', 'erratum', 'corrigendum', 'inclusion', 'diversity',
    'scholarly publish', 'peer review process', 'curriculum', 'teaching', 'education',
    'zika', 'outbreak', 'health-care', 'epidemiolog',
  ],
};

/** Records that are journal front matter or bad Semantic Scholar matches, not research. */
const NON_RESEARCH_TITLE = /^(thank you to our|thank you,? our|supplementary materials|author'?s personal copy|erratum|corrigendum|editorial board|front matter|table of contents)/i;

/**
 * Suggests research-area tags for a publication.
 *
 * This is a suggestion, never an authority. The upsert pipeline surfaces it for
 * approval; the CV Area column overrides it wherever the CV has an opinion.
 *
 * @param {{title?: string, abstract?: string, venue?: string, keywords?: string[]}} pub
 * @returns {{areas: string[], confidence: 'high'|'low'|'none', scores: Record<string, number>, nonResearch: boolean, matched: Record<string, string[]>}}
 */
export function inferResearchAreas(pub) {
  const title = String(pub?.title || '');
  const body = [pub?.abstract || '', pub?.venue || '', ...(pub?.keywords || [])].join(' ');
  const t = title.toLowerCase();
  const b = body.toLowerCase();

  const nonResearch = NON_RESEARCH_TITLE.test(title.trim());

  const scores = {};
  const matched = {};
  for (const [area, terms] of Object.entries(SIGNALS)) {
    let score = 0;
    const hits = [];
    for (const term of terms) {
      if (t.includes(term)) { score += 2; hits.push(term); }
      else if (b.includes(term)) { score += 1; hits.push(term); }
    }
    scores[area] = score;
    if (hits.length) matched[area] = hits;
  }

  if (nonResearch) {
    return { areas: [MISC], confidence: 'low', scores, nonResearch, matched };
  }

  const best = Math.max(...CANONICAL_AREAS.map((a) => scores[a] || 0));
  if (best === 0) return { areas: [], confidence: 'none', scores, nonResearch, matched };

  // Keep any theme scoring at least half the leader, so genuinely cross-cutting
  // papers (a sensing method applied to smallholder agriculture) get both tags.
  const threshold = Math.max(2, best / 2);
  const areas = orderAreas(
    CANONICAL_AREAS.filter((a) => a !== MISC && (scores[a] || 0) >= threshold),
  );
  if (!areas.length) return { areas: [MISC], confidence: 'low', scores, nonResearch, matched };

  return { areas, confidence: best >= 4 ? 'high' : 'low', scores, nonResearch, matched };
}
