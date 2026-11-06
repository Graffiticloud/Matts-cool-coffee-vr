/* Shared positions for the practical bench model. */
export const G = 0.03;            // floor top
export const BT = G + 1.0;        // bench top
export const ST = {               // station centres on the bench tops
  A:[-4.6, -2.7], E:[0, -2.7], C:[4.6, -2.7],
  B:[-4.6, 1.9], D:[0, 1.9], F:[4.6, 1.9]
};
/* pin above a station, nudged towards the default camera */
export const pin = (id, dy = 2.9, dx = 0.9) => [ST[id][0] + dx, BT + dy, ST[id][1] + 0.5];
