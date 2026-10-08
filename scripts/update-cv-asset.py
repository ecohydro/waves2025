#!/usr/bin/env python3
"""Upload the full CV PDF to Sanity and point person-kelly-caylor.cvFile at it.

Run from the waves2025 repo root on the Mac:
    python3 scripts/update-cv-asset.py
Optional: pass a different PDF path as the first argument.
"""
import json, os, sys, urllib.parse, urllib.request

PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/dev/biobib/CV - Caylor.pdf')
ENV = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')

env = {}
for line in open(ENV):
    if '=' in line and not line.startswith('#'):
        k, v = line.strip().split('=', 1)
        env[k] = v.strip().strip('"').strip("'")
PID, DS, TOKEN = env['NEXT_PUBLIC_SANITY_PROJECT_ID'], env['NEXT_PUBLIC_SANITY_DATASET'], env['SANITY_API_EDITOR_TOKEN']
H = {"Authorization": f"Bearer {TOKEN}"}
API = f"https://{PID}.api.sanity.io/v2023-05-03"

def query(groq):
    q = urllib.parse.quote(groq)
    return json.load(urllib.request.urlopen(urllib.request.Request(f"{API}/data/query/{DS}?query={q}", headers=H)))['result']

CV_Q = '*[_id=="person-kelly-caylor"]{"cv":cvFile.asset->{_id,originalFilename,size,url}}'
print("before:", query(CV_Q))

data = open(PDF, 'rb').read()
print(f"uploading {PDF} ({len(data)} bytes)")
r = json.load(urllib.request.urlopen(urllib.request.Request(
    f"{API}/assets/files/{DS}?filename=KCaylor_CV.pdf", data=data,
    headers={**H, "Content-Type": "application/pdf"}, method="POST")))
aid = r['document']['_id']
print("uploaded asset:", aid)

body = {"mutations": [{"patch": {"id": "person-kelly-caylor",
        "set": {"cvFile": {"_type": "file", "asset": {"_type": "reference", "_ref": aid}}}}}]}
json.load(urllib.request.urlopen(urllib.request.Request(
    f"{API}/data/mutate/{DS}", data=json.dumps(body).encode(),
    headers={**H, "Content-Type": "application/json"}, method="POST")))
print("after:", query(CV_Q))
print("Done. The people page reads Sanity at request time, so no redeploy is needed.")
