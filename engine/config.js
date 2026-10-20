/* Shared endpoints for every model. Leave a value empty to switch that feature off (the quiz still works; nothing is sent).
   tutorUrl and researchUrl are the Cloudflare Worker (ops/tutor-worker); scoresUrl is the Apps Script web app (ops/scores).
   Research capture also needs ?study=CODE on the page address and the participant's consent. */
export const CONFIG = {
  tutorUrl: 'https://xr-diorama.matthew-frew.workers.dev/tutor',
  researchUrl: 'https://xr-diorama.matthew-frew.workers.dev',
  scoresUrl: ''   // paste the Apps Script web app address here: https://script.google.com/macros/s/XXXXXXXX/exec
};
