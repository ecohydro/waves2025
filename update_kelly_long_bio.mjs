import fetch from 'node-fetch';

const projectId = '6r5yojda';
const dataset = 'production';
const token = 'skVSWRIwp1c9WDButVO7vMI6lC6OgPfOOzn5r8lNx9RwhmH5czUB6ReIP48ErZFp7MDXbCxKFxm3C4I3PQ76yJhTPsjuRzOmNivtlYxWd3PLb2ESmmmfmLQMrGvwTbTxhk9U0QdnkZHklbB42KbghBD749QwF6GvIQvbudFlRnz2bp5whJmp';

const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/mutate/${dataset}`;

// Convert Slack-style markdown to standard markdown
const newBio = `Kelly Caylor serves as the Associate Vice Chancellor for Innovation and holds joint appointments at the Bren School and the Department of Geography. In his research, Professor Caylor seeks to develop improved insight into the way that land use and climate change are interacting to affect the dynamics and resilience of global drylands. His primary research sites are in sub-Saharan Africa and the US Southwest, where he is focused on understanding the vulnerability of both managed and unmanaged ecosystems to current and future changes in hydrological dynamics. Professor Caylor conducts research at a number of spatial and temporal scales; from small-scale experiments during individual rainfall events all the way up to continental-scale analyses of climate trends. A major focus of his research is the development of new methods to improve the measurement and prediction of ecosystem water-use efficiency and novel observation networks for the characterization of coupled natural-human system dynamics. He co-founded [Arable Labs, Inc](https://www.arable.com), a decision agriculture company focused on integrated sensing for improved farm management. Professor Caylor is the Editor in Chief of the AGU journal, [Earth's Future](https://agupubs.onlinelibrary.wiley.com/journal/23324277), and has previously served on the editorial boards of Water Resources Research, the Journal of Geophysical Research — Biogeosciences, Vadose Zone Journal, and the Environmental Research Reviews section of Environmental Research Letters. He was a recipient of an Early Career Award from the NSF and was the inaugural recipient of the Early Career Award in Hydrological Sciences given by the [American Geophysical Union](https://www.agu.org/user-profile?cstkey=58E9027D-3B08-4A75-8E54-570B446C0F00) (AGU).`;

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
      console.log('✓ Updated Kelly\'s bio successfully');
      console.log('Transaction ID:', data.transactionId);
    } catch (e) {
      console.log('Response:', text);
    }
  }
} catch (err) {
  console.error('Error:', err.message);
}
