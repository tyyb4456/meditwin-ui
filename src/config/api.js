/**
 * api.js — Centralized API base URL config
 *
 * In development (npm run dev):
 *   Vite dev server proxies each /api/<service>/* path to localhost:PORT,
 *   so relative paths like `/api/patient-context` work seamlessly.
 *
 * In production (Docker / Nginx):
 *   Nginx proxies /api/<service>/* → <service-container>:PORT
 *   so the same relative paths work without any env-var wiring.
 *
 * Usage:
 *   import { API } from '@/config/api';
 *   fetch(`${API.PATIENT_CONTEXT}/stream`, { ... })
 */

const isDev = import.meta.env.DEV;

/**
 * In dev we hit localhost:<port> directly.
 * In production the Nginx reverse proxy handles the routing.
 */
export const API = {
  ORCHESTRATOR:     isDev ? 'http://127.0.0.1:8000' : '/api/orchestrator',
  PATIENT_CONTEXT:  isDev ? 'http://127.0.0.1:8001' : '/api/patient-context',
  DIAGNOSIS:        isDev ? 'http://127.0.0.1:8002' : '/api/diagnosis',
  LAB_ANALYSIS:     isDev ? 'http://127.0.0.1:8003' : '/api/lab-analysis',
  DRUG_SAFETY:      isDev ? 'http://127.0.0.1:8004' : '/api/drug-safety',
  IMAGING_TRIAGE:   isDev ? 'http://127.0.0.1:8005' : '/api/imaging-triage',
  DIGITAL_TWIN:     isDev ? 'http://127.0.0.1:8006' : '/api/digital-twin',
  EXPLANATION:      isDev ? 'http://127.0.0.1:8009' : '/api/explanation',
  CONVERSATIVE:     isDev ? 'http://127.0.0.1:8010' : '/api/conversative-agent',
};
