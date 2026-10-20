/* Shared endpoints for every model. Leave a value empty to switch that feature off (the quiz still works; nothing is sent).
   tutorUrl and researchUrl are the Cloudflare Worker (ops/tutor-worker); scoresUrl is the Apps Script web app (ops/scores).
   Research capture also needs ?study=CODE on the page address and the participant's consent. */
export const CONFIG = {
  tutorUrl: 'https://xr-diorama.matthew-frew.workers.dev/tutor',
  researchUrl: 'https://xr-diorama.matthew-frew.workers.dev',
  scoresUrl: 'https://script.google.com/macros/s/AKfycbxN8mKsjX0XR967Nv8LdOQSoGH3nhHoTaxR3FX_x_MiFW1YRXvnmpsr2XpiLBcPEl5B/exec'
};
