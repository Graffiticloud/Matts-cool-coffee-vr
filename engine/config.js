/* Shared endpoints for every model. Paste the two URLs here after deploying ops/tutor-worker and ops/scores.
   Leave a value empty to switch that feature off (the quiz still works; nothing is sent). */
export const CONFIG = {
  tutorUrl: '',   // e.g. https://baa-tutor.<your-subdomain>.workers.dev
  scoresUrl: ''   // e.g. https://script.google.com/macros/s/XXXXXXXX/exec
};
