// The world's conditional gates: cells that are one thing until a flag is set and another after. The bridge on the
// road south of Vault is out (the river runs where it stood) until the party has come to Kalay the long way round -
// through the Goma Cave, Bilibin, the Kolima Bridge, Mogall Forest, the Alpine Crossing and the Lamakan Desert, as the
// guide walks it; once Kalay is reached, the bridge stands again and the back way north to Vault and Lunpa (the guide's
// chapter 12: 'go east through the Gondowan Cave, then head north towards the cave next to Lunpa') is open.
// tools/world_gate.py counts these cells as walls when it plugs the world's other leaks.
'use strict';
const WORLD_GS1_GATES = [
  { cells: [[57, 56]], flag: 'visited:kalay', shut: 'r', open: 'b', note: 'the second bridge on the road from Vault down to Kalay, just north of Kalay (the bridge the caravan found broken)' },
];
