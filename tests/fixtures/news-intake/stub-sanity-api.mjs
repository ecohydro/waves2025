// Replaces global fetch so the runner can be exercised end to end offline.
const calls = [];
globalThis.__stubCalls = calls;

const NEWS_ROWS = [
  { _id: 'news-old-1', ts: null, slug: 'agu-fall-meeting-2020' },
  { _id: 'drafts.news-slack-1700000000-000001', ts: '1700000000.000001', slug: 'already-drafted' },
  { _id: 'news-slack-1650000000-000001', ts: '1650000000.000001', slug: 'already-published' },
];

const DRAFT_DOC = {
  _id: 'drafts.news-slack-1700000000-000001',
  _type: 'news',
  title: 'An update that was already drafted last run',
  slug: { _type: 'slug', current: 'already-drafted' },
  excerpt: 'Should be skipped as a duplicate.',
  content:
    'This message already produced a draft news document, so a rerun must not create a second one.',
  category: 'general',
  publishedAt: '2023-11-14T22:13:20.000Z',
  author: { _type: 'reference', _ref: 'person-bryn-morgan' },
  intake: { slackTs: '1700000000.000001' },
};

const PEOPLE_ROWS = [
  { _id: 'person-kelly-caylor', name: 'Kelly K. Caylor', email: 'caylor@ucsb.edu' },
  { _id: 'person-bryn-morgan', name: 'Bryn Morgan', email: 'brynmorgan@ucsb.edu' },
];

const json = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  calls.push({ href, method: init.method || 'GET', body: init.body });

  if (href.includes('/data/query/')) {
    const q = JSON.parse(init.body).query;
    if (q.includes('_type == "news"')) return json({ result: NEWS_ROWS });
    if (q.includes('_type == "person"')) return json({ result: PEOPLE_ROWS });
    if (q.includes('_id == $id')) return json({ result: DRAFT_DOC });
    return json({ result: [] });
  }
  if (href.includes('/data/mutate/')) {
    return json({ transactionId: 'tx-stub', results: [{ id: 'stub', operation: 'create' }] });
  }
  if (href.includes('/assets/images/')) {
    return json({ document: { _id: 'image-stub-1200x800-jpg' } });
  }
  if (href.includes('files.slack.com')) {
    return new Response(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]), {
      status: 200,
      headers: { 'content-type': 'image/jpeg' },
    });
  }
  if (href.includes('unauthorized.slack.com')) {
    return new Response('<html>sign in</html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  }
  throw new Error(`unexpected fetch to ${href}`);
};

process.on('exit', () => {
  for (const c of calls) {
    if (c.href.includes('/data/mutate/')) {
      console.log('\n--- MUTATION SENT ---');
      console.log(JSON.stringify(JSON.parse(c.body), null, 2));
    }
    if (c.href.includes('/assets/images/')) console.log('\n--- ASSET UPLOAD ---', c.href);
  }
});
