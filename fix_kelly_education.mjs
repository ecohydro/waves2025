import fetch from 'node-fetch';

const projectId = '6r5yojda';
const dataset = 'production';
const token = 'skVSWRIwp1c9WDButVO7vMI6lC6OgPfOOzn5r8lNx9RwhmH5czUB6ReIP48ErZFp7MDXbCxKFxm3C4I3PQ76yJhTPsjuRzOmNivtlYxWd3PLb2ESmmmfmLQMrGvwTbTxhk9U0QdnkZHklbB42KbghBD749QwF6GvIQvbudFlRnz2bp5whJmp';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}`;

const body = {
  mutations: [
    {
      patch: {
        id: 'person-kelly-caylor',
        set: {
          education: [
            {
              degree: 'PhD',
              field: 'Environmental Sciences',
              institution: 'University of Virginia',
              year: 2003
            }
          ]
        }
      }
    }
  ]
};

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log('Status:', res.status);
  const text = await res.text();
  
  if (text) {
    try {
      const data = JSON.parse(text);
      console.log('✓ Updated Kelly\'s education to PhD 2003');
      console.log('Transaction ID:', data.transactionId);
    } catch (e) {
      console.log('Response:', text);
    }
  }
} catch (err) {
  console.error('Error:', err.message);
}
