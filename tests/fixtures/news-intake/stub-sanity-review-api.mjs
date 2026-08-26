// Stubbed Sanity API for exercising news-review.mjs offline.
const calls = [];

const DRAFT = {
  _id: 'drafts.news-slack-1786500000-000100',
  _rev: 'rev1',
  _type: 'news',
  title: 'Sap flow sensors installed at Sedgwick Reserve',
  slug: { _type: 'slug', current: 'sap-flow-sensors-installed-at-sedgwick-reserve' },
  excerpt: 'Twelve sap flow sensors are now logging on blue oaks at Sedgwick Reserve.',
  content: 'Twelve sap flow sensors are now logging continuously on blue oaks at Sedgwick Reserve.',
  category: 'research',
  publishedAt: '2026-08-12T02:00:00.000Z',
  author: { _type: 'reference', _ref: 'person-bryn-morgan' },
  status: 'draft',
  intake: { source: 'slack', slackTs: '1786500000.000100', submittedByName: 'Bryn Morgan' },
};
const DRAFT_INCOMPLETE = { ...DRAFT, _id: 'drafts.news-slack-1786500000-000400', title: 'Half finished item', slug: { current: 'half-finished-item' }, author: undefined, intake: { source: 'slack', slackTs: '1786500000.000400' } };
const DRAFTS = { [DRAFT._id]: DRAFT, [DRAFT_INCOMPLETE._id]: DRAFT_INCOMPLETE };

const json = (b) => new Response(JSON.stringify(b), { status: 200, headers: { 'content-type': 'application/json' } });

globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  calls.push({ href, body: init.body });
  if (href.includes('/data/query/')) {
    const { query: q, params } = JSON.parse(init.body);
    if (q.includes('path("drafts.**")')) {
      return json({ result: [
        { ...DRAFT, slug: DRAFT.slug.current, authorName: 'Bryn Morgan', photo: 'https://cdn.sanity.io/x.jpg', photoAlt: 'A sensor on a trunk' },
        { ...DRAFT_INCOMPLETE, slug: 'half-finished-item', authorName: null },
      ] });
    }
    if (q.includes('_id == $id')) return json({ result: DRAFTS[params.id] || null });
    if (q.includes('slug.current')) return json({ result: [{ slug: DRAFT.slug.current }] });
    return json({ result: [] });
  }
  if (href.includes('/data/mutate/')) return json({ transactionId: 'tx', results: [] });
  throw new Error(`unexpected fetch ${href}`);
};

process.on('exit', () => {
  for (const c of calls) {
    if (c.href.includes('/data/mutate/')) {
      const m = JSON.parse(c.body).mutations;
      console.log('\n--- MUTATION ---', JSON.stringify(m.map((x) => Object.keys(x)[0])), 
        m[0].createOrReplace ? `id=${m[0].createOrReplace._id} status=${m[0].createOrReplace.status}` : '',
        m[0].delete ? `delete=${m[0].delete.id}` : '', m[0].patch ? `patch=${JSON.stringify(m[0].patch.set)}` : '');
    }
  }
});
