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
  ORCHESTRATOR:    isDev ? '/api/orchestrator'    : 'https://orchestator-production-ab58.up.railway.app',
  PATIENT_CONTEXT: isDev ? '/api/patient-context' : 'https://patient-context-production.up.railway.app',
  DIAGNOSIS:       isDev ? '/api/diagnosis'       : 'https://diagnosis-production-b583.up.railway.app',
  LAB_ANALYSIS:    isDev ? '/api/lab-analysis'    : 'https://lab-production-9bda.up.railway.app',
  DRUG_SAFETY:     isDev ? '/api/drug-safety'     : 'https://drug-production-a7d4.up.railway.app',
  IMAGING_TRIAGE:  isDev ? '/api/imaging-triage'  : 'https://imaging-production.up.railway.app',
  DIGITAL_TWIN:    isDev ? '/api/digital-twin'    : 'https://twin-production-708e.up.railway.app',
  EXPLANATION:      isDev ? 'http://127.0.0.1:8009' : '/api/explanation',
  CONVERSATIVE: isDev 
    ? '/api/conversative-agent'   // proxied locally
    : 'https://conversative-production.up.railway.app',  // direct in prod
};
