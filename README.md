Time Space – Interactive History Map

A dark-themed web app that lets you travel through time: pick any city, instantly see five pivotal events on a map-linked timeline, and dive into rich summaries powered by live Wikipedia + OpenAI calls.

⸻

✨ Features

UI	Backend
🗺️ Leaflet map with animated pins	FastAPI micro-service (Python 3.11)
📜 Bottom timeline (five dots) with sleek card pop-ups	Stateless “agentic” workflow: fetch Wikipedia → rank events → return JSON
🎨 Dark-mode Tailwind styling + shadcn/ui components	Live queries only – no database required
⚡ Responsive layout (desktop & mobile)	OpenAI API integration (summaries, ranking)


⸻

🗂️ Project Structure


```
time-space/
├── docker-compose.yml     # two-service stack
├── .env.example           # template for secrets
├── frontend/              # React + Vite + Tailwind
│   ├── Dockerfile
│   └── src/...
└── backend/                 # FastAPI + Wikipedia + OpenAI
    ├── Dockerfile
    ├── requirements.txt
    └── main.py
```

⸻

uild & run

docker compose up --build


	3.	Visit:

	•	Frontend – http://localhost:5173
	•	API docs – http://localhost:8000/docs

Tip: Both containers share timespace_net, so VITE_API_URL is already wired to the agent.

⸻

🛠️ Local Dev (without Docker)

# Backend
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd ../frontend
npm i
npm run dev

Set VITE_API_URL=http://localhost:8000 in frontend/.env.

⸻

⚙️ Environment Variables

Var	Description
OPENAI_API_KEY	Required – your OpenAI secret
VITE_API_URL	Frontend → backend base URL (default in docker compose)


⸻

🌐 Free-Tier Deployment Ideas

Layer	Service
Static UI	Cloudflare Pages, Vercel, Netlify
Agent API	Cloudflare Workers, AWS Lambda, Render free tier
Map Tiles	OpenStreetMap or MapTiler free plan


⸻

📡 API Contract

Endpoint: POST /query
Body:

{ "location": "Las Vegas" }

Response: TimelinePayload – location info + five TimelineEvent objects.

⸻

🗺️ Roadmap
	•	Real geocoding (Mapbox/OSM Nominatim)
	•	Event category filters (economic / cultural / political)
	•	Caching layer for repeat queries (Cloudflare KV)
	•	User accounts & favorites (optional Supabase)

⸻

🤝 Contributing
	1.	Fork & create a feature branch.
	2.	Run npm run lint && npm run test.
	3.	PR with clear description.

⸻

📄 License

MIT – do what you want, just give credit.