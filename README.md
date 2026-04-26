# 🖥️ MediTwin UI — Clinical Intelligence Dashboard

> The React + Vite + Tailwind CSS frontend for the MediTwin AI multi-agent clinical decision support platform.

---

## 📐 Architecture Overview

MediTwin UI is a **single-page React application** that connects to the MediTwin AI microservices backend via REST and Server-Sent Events (SSE) for real-time streaming.

```
meditwin-ui/
├── src/
│   ├── LandingPage.jsx              # Marketing / intro page
│   ├── App.jsx                      # Router definition
│   ├── main.jsx                     # React entry point
│   ├── index.css                    # Global styles
│   ├── pages/
│   │   ├── Dashboard.jsx            # Main dashboard
│   │   ├── MicroservicesAgents.jsx  # Agent selection hub
│   │   ├── PatientContextPage.jsx   # Patient Context Agent UI
│   │   ├── DiagnosisAgent.jsx       # Diagnosis Agent UI (RAG)
│   │   ├── LabAnalysisAgent.jsx     # Lab Analysis Agent UI
│   │   ├── DrugSafetyAgent.jsx      # Drug Safety Agent UI
│   │   ├── ImagingTriageAgent.jsx   # Imaging Triage Agent UI
│   │   ├── DigitalTwinAgent.jsx     # Digital Twin Simulation UI
│   │   ├── OrchestratorPage.jsx     # Full workflow orchestrator UI
│   │   └── ConversationalChatbot.jsx # Tool agent chat interface
│   └── components/
├── index.html
├── vite.config.js
└── package.json
```

### Route Map

| URL Path | Page | Backend Port |
|---|---|---|
| `/` | Landing Page | — |
| `/dashboard` | Dashboard | — |
| `/dashboard/microservices` | Agent Hub | — |
| `/dashboard/microservices/patient-context` | Patient Context | `8001` |
| `/dashboard/microservices/diagnosis-agent` | Diagnosis | `8002` |
| `/dashboard/microservices/lab-analysis` | Lab Analysis | `8003` |
| `/dashboard/microservices/drug-safety` | Drug Safety | `8004` |
| `/dashboard/microservices/imaging-triage` | Imaging Triage | `8005` |
| `/dashboard/microservices/digital-twin` | Digital Twin | `8006` |
| `/dashboard/orchestrator` | Orchestrator | `8000` |
| `/dashboard/chatbot` | Conversational AI | `8010` |

---

## 🚀 Quick Start — Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20 LTS
- [npm](https://www.npmjs.com/) ≥ 10 (bundled with Node.js)
- The **MediTwin AI backend** running locally or via Docker (see [`meditwin-ai/README.md`](../meditwin-ai/README.md))

### Step 1 — Clone & navigate

```bash
git clone <your-repo-url>
cd meditwin-ui
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Start the development server

```bash
npm run dev
```

The app will be available at **[http://localhost:5173](http://localhost:5173)**.

Vite's dev server supports **Hot Module Replacement (HMR)** — changes reflect instantly without full page reload.

### Step 4 — Make sure the backend is running

The UI connects to these backend URLs by default (hardcoded per-page):

| Agent | Default URL |
|---|---|
| Orchestrator | `http://localhost:8000` |
| Patient Context | `http://localhost:8001` |
| Diagnosis | `http://localhost:8002` |
| Lab Analysis | `http://localhost:8003` |
| Drug Safety | `http://localhost:8004` |
| Imaging Triage | `http://localhost:8005` |
| Digital Twin | `http://localhost:8006` |
| Tool Agent (Chat) | `http://localhost:8010` |

Start the backend with Docker Compose before using the UI:

```bash
cd ../meditwin-ai
docker-compose up
```

---

## 🐳 Docker — Running the UI in a Container

### Step 1 — Create a `Dockerfile` in `meditwin-ui/`

```dockerfile
# meditwin-ui/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage — serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2 — Create `nginx.conf` for SPA routing

```nginx
# meditwin-ui/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # React Router — redirect all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

### Step 3 — Add the UI to `meditwin-ai/docker-compose.yml`

Add this service block to the bottom of `docker-compose.yml` (inside `services:`):

```yaml
  meditwin-ui:
    build:
      context: ../meditwin-ui
      dockerfile: Dockerfile
    container_name: meditwin-ui
    ports:
      - "3000:80"
    networks:
      - meditwin-network
    depends_on:
      - orchestrator
      - tool-agent
    restart: unless-stopped
```

Then bring up the full stack including the UI:

```bash
cd meditwin-ai
docker-compose up --build
```

The UI will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## 🏗️ Build for Production

```bash
npm run build
```

The compiled output is placed in `dist/`. You can serve it with any static file host (Nginx, Vercel, Netlify, etc.).

### Preview the production build locally

```bash
npm run preview
```

Serves the `dist/` folder at **[http://localhost:4173](http://localhost:4173)**.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| CSS | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Streaming | Browser `EventSource` (SSE) |
| Language | JavaScript (ESModules) |

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all source files |

---

## 🌐 Connecting to a Remote Backend

If your MediTwin AI backend is deployed to a remote server or cloud, update the API base URLs in each relevant page file.

For example, in `src/pages/DiagnosisAgent.jsx`, find:

```js
const BASE_URL = 'http://localhost:8002'
```

And update it to your remote address:

```js
const BASE_URL = 'https://your-backend-domain.com'
```

> 💡 **Tip:** For a cleaner approach, extract all base URLs into a single `src/config.js` file and import from there.

---

## ❓ Troubleshooting

**Blank page / white screen on load**
→ Open DevTools (F12) → Console. Usually means a missing import or a build error. Run `npm install` again.

**API requests failing (CORS errors)**
→ Ensure the backend is running and allows your frontend origin. For local dev, both must run simultaneously.

**SSE stream not connecting**
→ Check that the specific agent container is healthy. Verify the port matches what the page is connecting to.

**`npm install` fails**
→ Ensure Node.js ≥ 20 is installed: `node --version`. Try clearing the cache: `npm cache clean --force`.

**Vite port 5173 already in use**
→ Kill the process or change the port in `vite.config.js`:

```js
export default defineConfig({
  server: {
    port: 3000,
  },
  // ...
})
```
