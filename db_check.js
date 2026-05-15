const projectId = 'd2378d89-ea29-4ba1-aca3-cc4abc6ceaa2';
const apiKey = 'TeXJL8egtJTD5izd7GM5o-Cnekbr9wYQoXYquedz';

async function fetchCollection(name) {
  const res = await fetch(`https://api.cocobase.app/v1/projects/${projectId}/collections/${name}/documents`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!res.ok) return console.log(name, await res.text());
  const data = await res.json();
  console.log(`\n--- ${name.toUpperCase()} ---`);
  console.log(JSON.stringify(data.documents || data, null, 2));
}

async function run() {
  await fetchCollection('channels');
  await fetchCollection('signals');
}

run();
