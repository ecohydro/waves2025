import fetch from 'node-fetch';

const projectId = '6r5yojda';
const dataset = 'production';
const token = 'skVSWRIwp1c9WDButVO7vMI6lC6OgPfOOzn5r8lNx9RwhmH5czUB6ReIP48ErZFp7MDXbCxKFxm3C4I3PQ76yJhTPsjuRzOmNivtlYxWd3PLb2ESmmmfmLQMrGvwTbTxhk9U0QdnkZHklbB42KbghBD749QwF6GvIQvbudFlRnz2bp5whJmp';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}`;

// Update bio with markdown link instead of HTML
const newBio = "Professor at the Bren School of Environmental Science & Department of Geography. Director of the Earth Research Institute at UCSB. Kelly is a recipient of an Early Career Award from the NSF, and was the inaugural recipient of the Early Career Award in Hydrological Sciences from the American Geophysical Union (AGU). He is co-founder of [Arable Labs, Inc](http://www.arable.com). He is currently the Editor in Chief of Earth's Future.";

const body = {
  mutations: [
    {
      patch: {
        id: 'person-kelly-caylor',
        set: {
          bio: newBio
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
      console.log('Updated bio field successfully');
      console.log('Transaction ID:', data.transactionId);
    } catch (e) {
      console.log('Response:', text);
    }
  }
} catch (err) {
  console.error('Error:', err.message);
}
