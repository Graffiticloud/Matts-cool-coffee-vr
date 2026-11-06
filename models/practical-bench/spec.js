/* Content for the practical bench. Six branching practical scenarios (one per station) and four quiz pins.
   open:true: anonymous school use, nothing recorded or sent anywhere, no tutor.
   scenario() turns a compact list of steps into the engine's step graph: the best choice moves on; every other choice
   leads to a consequence step that offers a fix (back on track) or carrying on regardless (a poor ending). */
import { G, pin } from './layout.js';

const SPEC_H = 'Qualifications Scotland (2026) Higher Chemistry course specification, Researching chemistry. Available at: https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-chemistry.pdf (Accessed: 6 November 2026).';
const SPEC_AH = 'Qualifications Scotland (2026) Advanced Higher Chemistry course specification, Researching chemistry. Available at: https://www.sqa.org.uk/sqa/files_ccc/ah-course-spec-chemistry.pdf (Accessed: 6 November 2026).';
const REP_H = 'SQA (2025) Higher Chemistry course report. Available at: https://www.sqa.org.uk/sqa/files_ccc/2025-h-course-report-chemistry.pdf (Accessed: 6 November 2026).';
const REP_AH = 'SQA (2025) Advanced Higher Chemistry course report. Available at: https://www.sqa.org.uk/sqa/files_ccc/2025-ah-course-report-chemistry.pdf (Accessed: 6 November 2026).';

const CARRY = ['Carry on without changing anything.', 'The mistake is now built into every result that follows, so the final answer cannot be trusted.'];

function scenario(id, title, steps, good, bad){
  const out = {};
  const next = i => i + 1 < steps.length ? 's' + (i + 1) : 'end_good';
  steps.forEach((s, i) => {
    const choices = [];
    s.wrong.forEach((w, j) => {
      const pid = `p${i}_${j}`;
      choices.push({ label:w.label, next:pid, feedback:w.feedback, effect:w.effect });
      out[pid] = { title:w.title, effect:w.effect, text:w.text, choices:[
        { label:w.fix, best:true, next:next(i), feedback:w.fixFeedback, effect:s.after },
        { label:(w.carry || CARRY)[0], next:'end_bad', feedback:(w.carry || CARRY)[1] }
      ] };
    });
    const best = { label:s.best[0], best:true, next:next(i), feedback:s.best[1], effect:s.after };
    choices.splice(i % (choices.length + 1), 0, best);   // move the best answer around
    out['s' + i] = { title:s.title, effect:s.effect, text:s.text, choices };
  });
  out.end_good = { end:true, outcome:'good', ...good };
  out.end_bad = { end:true, outcome:'poor', ...bad };
  return { id, title, start:'s0', steps:out };
}

/* ---------- A: titration ---------- */
const titration = scenario('titration', 'Titration: ethanoic acid in vinegar', [
  { title:'Fill the burette', effect:'calm', after:'burette',
    text:'You are finding the concentration of ethanoic acid in diluted vinegar by titrating it with 0.100 mol l⁻¹ sodium hydroxide solution. The burette has just been washed and is wet with distilled water. How do you get it ready?',
    best:['Rinse it with a little of the sodium hydroxide solution, fill it below eye level using a funnel, remove the funnel, and run some solution through so the jet is full.', 'Rinsing with the titrant stops leftover water diluting it. Removing the funnel stops drips changing the reading, and filling the jet stops an air bubble being counted as a volume.'],
    wrong:[
      { label:'Rinse it with distilled water only, then fill it.', effect:'burette_bad', feedback:'The water left inside dilutes the sodium hydroxide, so you need more of it to reach the end-point.',
        title:'Titres creeping up', text:'Your titres are larger than expected, so the acid would look more concentrated than it is.',
        fix:'Empty the burette, rinse it with sodium hydroxide solution and refill it.', fixFeedback:'Good. Rinsing with the solution it will hold is the standard fix.' },
      { label:'Stand on a stool to fill it above head height, and leave the funnel in the top.', effect:'burette_bad', feedback:'Filling above eye level risks splashing alkali into your eyes, and drips from the funnel change the reading during the titration.',
        title:'Readings that drift', text:'Your first reading changes by itself as the last drops run out of the funnel.',
        fix:'Take the burette down, fill it below eye level and remove the funnel before reading.', fixFeedback:'Right: safer, and the reading only changes when you open the tap.' }
    ] },
  { title:'Measure the vinegar', effect:'burette', after:'pipette',
    text:'Next you need exactly 20.0 cm³ of the diluted vinegar in a conical flask.',
    best:['Use a 20.0 cm³ pipette with a pipette filler, with the bottom of the meniscus on the line at eye level. Let it drain and touch the tip on the surface; do not blow out the last drop.', 'A pipette is calibrated to deliver its volume and leave that last drop behind. It is far more accurate than a measuring cylinder.'],
    wrong:[
      { label:'Use a 25 cm³ measuring cylinder; it is quicker.', effect:'burette_bad', feedback:'A measuring cylinder has a much larger uncertainty than a pipette, so the volume of acid, and your final answer, is less accurate.',
        title:'Spread-out titres', text:'Your titres disagree by over 0.5 cm³, because each portion of vinegar was a slightly different volume.',
        fix:'Repeat with a 20.0 cm³ pipette and filler.', fixFeedback:'Correct choice of apparatus: an accurately known volume of the solution being analysed.' },
      { label:'Use the pipette, then blow out the last drop so none is wasted.', effect:'burette_bad', feedback:'Pipettes are calibrated to deliver their volume with the last drop left in the tip. Blowing it out adds extra.',
        title:'Too much acid', text:'Every portion contains slightly more than 20.0 cm³, so every titre is slightly too large.',
        fix:'Repeat, letting the pipette drain and touching the tip on the surface.', fixFeedback:'Good: use the pipette the way it was calibrated.' }
    ] },
  { title:'Add the indicator', effect:'pipette', after:'indicator',
    text:'This is a weak acid being titrated with a strong base. What do you add, and where does the flask go?',
    best:['Two or three drops of phenolphthalein, with the flask on a white tile.', 'Phenolphthalein changes colour in the alkaline pH range where the end-point of a weak acid and strong base falls. The white tile makes the first permanent pink easy to see.'],
    wrong:[
      { label:'A full pipette (about 2 cm³) of phenolphthalein, so the colour is easy to see.', effect:'burette_bad', feedback:'Indicators are weak acids themselves. A large volume reacts with some of the alkali and changes the titre.',
        title:'An indicator that takes part', text:'Your end-point needs slightly more alkali than it should.',
        fix:'Start again with two or three drops.', fixFeedback:'Right. Use the smallest amount that gives a clear colour change.' },
      { label:'Methyl orange, because it is in the cupboard.', effect:'burette_bad', feedback:'Methyl orange changes colour at a low pH, well before the equivalence point of a weak acid and strong base.',
        title:'An early end-point', text:'The colour changes long before the acid has all reacted, so the titre is too small.',
        fix:'Change to phenolphthalein.', fixFeedback:'Correct: match the indicator to the pH at the equivalence point.' }
    ] },
  { title:'Run the titration', effect:'indicator', after:'endpoint',
    text:'Time to titrate. How do you do it?',
    best:['Do a quick rough titration first. Then, in the accurate titrations, add the alkali steadily while swirling, then drop by drop near the end-point, washing the walls with distilled water, and stop at the first permanent pale pink.', 'The rough titre tells you where to slow down. Washing the walls makes sure all the acid reacts, and the water does not change the number of moles present.'],
    wrong:[
      { label:'Open the tap fully and close it when the flask turns pink.', effect:'overshoot', feedback:'At full flow, several drops of alkali enter after the end-point. The deep pink shows you have overshot.',
        title:'Overshot', text:'The flask is deep pink. Your titre is too large by an unknown amount.',
        fix:'Discard it and repeat, adding the alkali dropwise near the end-point.', fixFeedback:'Good. An overshot titration cannot be rescued, only repeated.' },
      { label:'Stop at the first pink flash, even though it fades when you swirl.', effect:'titrate', feedback:'A fading flash means the alkali has only reacted locally. The end-point is the first pink that stays after swirling.',
        title:'Not quite finished', text:'Your titre is slightly too small: some acid has not yet reacted.',
        fix:'Repeat and stop at the first permanent pale pink.', fixFeedback:'Correct end-point.' }
    ] },
  { title:'Choose the titres', effect:'endpoint', after:'endpoint',
    text:'Your results are 15.40 cm³ (rough), 14.80 cm³, 14.70 cm³ and 14.75 cm³. Which average do you use?',
    best:['14.75 cm³: the mean of the three concordant titres, leaving out the rough one.', 'Concordant titres agree closely. The rough titre is only a guide and is not used in the average.'],
    wrong:[
      { label:'14.91 cm³: the mean of all four titres.', effect:'titre_bad', feedback:'Including the rough titre drags the average up.',
        title:'An inflated average', text:'Your calculated concentration comes out about 1% too high.',
        fix:'Recalculate using the three concordant titres only.', fixFeedback:'Right: 14.75 cm³.' },
      { label:'14.70 cm³: the smallest titre, because it is the most careful one.', effect:'titre_bad', feedback:'Picking one result throws away the evidence from the others. Use the mean of the concordant results.',
        title:'Cherry-picked', text:'Your answer depends on a single result, so there is no evidence it is reliable.',
        fix:'Use the mean of the concordant titres.', fixFeedback:'Correct.' }
    ] }
], { title:'Accurate result', text:'14.75 cm³ of 0.100 mol l⁻¹ NaOH contains 1.475 × 10⁻³ mol, so the diluted vinegar is 0.0738 mol l⁻¹. Your technique protected every number in that calculation.', ref:`${SPEC_H} ${REP_H}` },
   { title:'Result not trustworthy', text:'Each shortcut added an error you could not correct afterwards. In a titration, technique is the result. Try the station again.', ref:SPEC_H });

/* ---------- B: standard solution ---------- */
const standard = scenario('standard', 'Making a standard solution', [
  { title:'Choose the solid', effect:'calm', after:'weigh',
    text:'You need 250 cm³ of a solution whose concentration is known accurately, to standardise an acid. Which solid do you use?',
    best:['Anhydrous sodium carbonate: a primary standard.', 'A primary standard is available in high purity, is stable in air, dissolves in water and has a fairly high GFM, so its mass gives an accurate number of moles.'],
    wrong:[
      { label:'Sodium hydroxide pellets.', effect:'weigh_bad', feedback:'Sodium hydroxide absorbs water and carbon dioxide from the air while you weigh it, so the mass is not all NaOH.',
        title:'Mass that keeps changing', text:'The balance reading creeps up as the pellets absorb moisture.',
        fix:'Switch to anhydrous sodium carbonate.', fixFeedback:'Right: a primary standard.' }
    ] },
  { title:'Weigh it', effect:'weigh', after:'weigh',
    text:'You need about 2.65 g. How do you weigh it?',
    best:['Weigh by difference: weigh the sample tube, tip the solid into a beaker, reweigh the tube, and record both masses to at least two decimal places.', 'The mass transferred is exactly the difference between the two weighings, even if some grains stay in the tube.'],
    wrong:[
      { label:'Weigh it on a piece of paper and tip it straight into the volumetric flask.', effect:'weigh_bad', feedback:'Grains stick to the paper and to the neck of the flask, so less solid reaches the solution than you recorded.',
        title:'Missing grains', text:'Solid is stuck in the neck of the flask and on the paper.',
        fix:'Start again and weigh by difference into a beaker.', fixFeedback:'Good.' }
    ] },
  { title:'Dissolve and transfer', effect:'weigh', after:'transfer',
    text:'The solid is in a beaker. What next?',
    best:['Dissolve it in a small volume of distilled water, stirring, then pour it into the volumetric flask through a funnel. Rinse the beaker, rod and funnel into the flask several times.', 'Rinsing carries every last trace of solute into the flask, so the number of moles stays exactly what you weighed.'],
    wrong:[
      { label:'Pour the solution into the flask, but skip the rinsing: it is only a few drops.', effect:'transfer_bad', feedback:'Those drops contain solute. Without rinsing, the solution is less concentrated than you calculate.',
        title:'A small but real loss', text:'Your “standard” solution is weaker than its label says.',
        fix:'Start again and rinse the beaker, rod and funnel into the flask.', fixFeedback:'Right.' }
    ] },
  { title:'Make up to the mark', effect:'transfer', after:'mark',
    text:'How do you bring the volume to exactly 250 cm³?',
    best:['Add distilled water until it is close to the mark, then add it dropwise until the bottom of the meniscus sits on the line, at eye level.', 'Going dropwise near the line stops you overshooting, and reading at eye level avoids parallax error.'],
    wrong:[
      { label:'Pour water in quickly until it looks about right.', effect:'overfill', feedback:'The meniscus is above the line. The solution is now more dilute than intended.',
        title:'Above the line', text:'The solution is over the mark. Pouring some out would remove solute as well as water.',
        fix:'Start again with a fresh portion of solid.', fixFeedback:'Correct: an overfilled standard solution has to be remade.',
        carry:['Pour a little out to bring it back to the line.', 'Pouring out removes solute too, so the concentration is still wrong.'] }
    ] },
  { title:'Mix it', effect:'mark', after:'invert',
    text:'The flask is filled to the mark. Anything else?',
    best:['Stopper it and invert it several times.', 'The solution in the neck and the bulb must be the same concentration before you take portions out.'],
    wrong:[
      { label:'No: it will mix by itself.', effect:'mix_bad', feedback:'Diffusion is slow. The first portions you take from the neck are more dilute than those from the bottom.',
        title:'Uneven solution', text:'Your first two titrations disagree with the rest.',
        fix:'Stopper and invert the flask several times, then start the titrations again.', fixFeedback:'Right.' }
    ] }
], { title:'Standard solution ready', text:'You weighed by difference, transferred every trace and made up to the mark at eye level. The concentration on the label is the concentration in the flask.', ref:`${SPEC_H} ${SPEC_AH}` },
   { title:'Not a standard any more', text:'A standard solution is only useful if its concentration is known accurately, and yours is not. Try the station again.', ref:SPEC_H });

/* ---------- C: heating to constant mass ---------- */
const constant = scenario('constant', 'Heating to constant mass: hydrated barium chloride', [
  { title:'Prepare the crucible', effect:'calm', after:'crucible',
    text:'You will find x in BaCl₂·xH₂O by heating the solid until all the water has gone. Where do you start?',
    best:['Heat the empty crucible and lid, cool them in a desiccator, and weigh them.', 'A crucible from the cupboard can hold moisture or residue. Heating and cooling it first gives a reliable starting mass.'],
    wrong:[
      { label:'Weigh the crucible straight from the cupboard.', effect:'crucible_bad', feedback:'Any moisture on the crucible will be driven off during heating and counted as water from your sample.',
        title:'A crucible that loses mass', text:'Your sample seems to lose slightly more water than it should.',
        fix:'Heat, cool and weigh the empty crucible first.', fixFeedback:'Good.' }
    ] },
  { title:'Heat the sample', effect:'crucible', after:'heat',
    text:'You have 2.44 g of hydrated barium chloride in the crucible. How do you heat it?',
    best:['Heat gently at first and then more strongly, with the lid slightly open.', 'Gentle heating stops the solid spitting out of the crucible, and the gap lets the steam escape.'],
    wrong:[
      { label:'Heat it strongly straight away, with the lid off.', effect:'spit', feedback:'Rapid heating makes the solid spit. Lost solid looks like lost water.',
        title:'Spitting', text:'Grains of solid have jumped out of the crucible.',
        fix:'Start again with a fresh sample and heat it gently first.', fixFeedback:'Right.' },
      { label:'Warm it on a hot plate at 80 °C.', effect:'heat_bad', feedback:'That is not hot enough to drive off all the water of crystallisation.',
        title:'Still hydrated', text:'The mass stops falling, but well above where it should.',
        fix:'Heat it in the crucible with a Bunsen burner.', fixFeedback:'Good.' }
    ] },
  { title:'Cool it', effect:'heat', after:'cool',
    text:'You have heated it for several minutes. How do you cool it before weighing?',
    best:['Move it with tongs into a desiccator and let it cool there.', 'A desiccator keeps the anhydrous solid from taking water back from the air as it cools.'],
    wrong:[
      { label:'Leave it on the heatproof mat on the bench.', effect:'cool_bad', feedback:'Anhydrous barium chloride absorbs water from the air as it cools.',
        title:'Mass creeping back up', text:'The reading rises while the crucible sits on the balance.',
        fix:'Reheat it, then cool it in the desiccator.', fixFeedback:'Right.' },
      { label:'Weigh it while it is still hot, to save time.', effect:'cool_bad', feedback:'Hot objects set up air currents that make the balance reading unreliable, and can damage the balance.',
        title:'An unsteady reading', text:'The balance display keeps changing.',
        fix:'Cool it in the desiccator first.', fixFeedback:'Good.' }
    ] },
  { title:'Constant mass', effect:'cool', after:'weighc',
    text:'After one heating the crucible and contents weigh 23.45 g. Are you finished?',
    best:['No: heat, cool and weigh again, and repeat until two consecutive masses agree.', 'Only when the mass stops changing can you be sure all the water has gone.'],
    wrong:[
      { label:'Yes: ten minutes is plenty.', effect:'cool_bad', feedback:'You have no evidence that all the water has gone. The next heating might lower the mass further.',
        title:'Unproven', text:'A second heating brings the mass down to 23.44 g.',
        fix:'Keep heating, cooling and weighing until the masses agree.', fixFeedback:'Correct: that is what constant mass means.' }
    ] },
  { title:'Calculate x', effect:'weighc', after:'weighc',
    text:'Hydrated sample: 2.44 g. Anhydrous BaCl₂ after heating to constant mass: 2.08 g (GFM 208.3). What is x?',
    best:['x = 2', 'Water lost = 0.36 g = 0.020 mol. BaCl₂ = 2.08 / 208.3 = 0.0100 mol. The ratio 0.020 : 0.0100 = 2 : 1, so BaCl₂·2H₂O.'],
    wrong:[
      { label:'x = 1', effect:'cool_bad', feedback:'Check the moles of water: 0.36 / 18.0 = 0.020 mol.',
        title:'Recheck the ratio', text:'Divide the moles of water by the moles of barium chloride.',
        fix:'0.020 / 0.0100 = 2, so x = 2.', fixFeedback:'Right.' }
    ] }
], { title:'BaCl₂·2H₂O', text:'You heated gently, cooled in a desiccator and heated to constant mass, so the mass lost is water and only water.', ref:`${SPEC_AH} ${REP_AH}` },
   { title:'The water count is wrong', text:'In gravimetric analysis every gram matters. Try the station again.', ref:SPEC_AH });

/* ---------- D: solvent extraction ---------- */
const extraction = scenario('extraction', 'Solvent extraction: iodine from water', [
  { title:'Choose the solvent', effect:'calm', after:'solvent',
    text:'You want to extract iodine from an aqueous solution. Which solvent do you use?',
    best:['Cyclohexane: it does not mix with water, and iodine is far more soluble in it.', 'A good extraction solvent is immiscible with water and dissolves the solute better than water does. Cyclohexane is also volatile, so it can be removed afterwards.'],
    wrong:[
      { label:'Ethanol: iodine dissolves well in it.', effect:'solvent_bad', feedback:'Ethanol mixes with water, so no separate layer forms and nothing can be separated.',
        title:'One layer', text:'The funnel holds a single brown solution.',
        fix:'Start again with cyclohexane.', fixFeedback:'Right: the solvent must be immiscible with water.' }
    ] },
  { title:'Shake it', effect:'solvent', after:'settle',
    text:'Both liquids are in the separating funnel with the tap closed and the stopper in. How do you mix them?',
    best:['Hold the stopper in, invert the funnel, shake gently, and open the tap regularly, pointing it up and away from people, to release the pressure.', 'Volatile solvents build up vapour pressure as you shake. Venting stops the stopper being forced out.'],
    wrong:[
      { label:'Shake it hard for a minute without opening the tap.', effect:'pressure', feedback:'The vapour pressure pushes the stopper out and sprays solvent.',
        title:'Stopper forced out', text:'The stopper has popped and some of the mixture is lost.',
        fix:'Start again, venting through the tap regularly as you shake.', fixFeedback:'Good: safe and no loss.' }
    ] },
  { title:'Separate the layers', effect:'settle', after:'drain',
    text:'The funnel is back in the ring. The upper layer is purple (iodine in cyclohexane) and the lower is pale (water). How do you separate them?',
    best:['Remove the stopper, let the layers settle, run the lower aqueous layer into a beaker, then pour the upper layer out through the top into a clean container.', 'Removing the stopper lets air in so the liquid drains. Pouring the upper layer from the top keeps it clean of drops in the stem.'],
    wrong:[
      { label:'Open the tap and run everything into one beaker.', effect:'drain_bad', feedback:'That undoes the separation.',
        title:'Back to the start', text:'Both layers are mixed in the beaker.',
        fix:'Return the mixture to the funnel and separate the layers properly.', fixFeedback:'Right.' },
      { label:'Leave the stopper in and open the tap.', effect:'tap_bad', feedback:'With the stopper in, air cannot get in and the liquid barely drains.',
        title:'Barely a trickle', text:'Only a few drops come out.',
        fix:'Remove the stopper, then drain the lower layer.', fixFeedback:'Good.' }
    ] },
  { title:'Get the most out', effect:'drain', after:'drain',
    text:'You have 30 cm³ of cyclohexane in total. How do you use it?',
    best:['Three extractions with 10 cm³ each, combining the organic layers.', 'Several small extractions remove more solute than one large one with the same total volume.'],
    wrong:[
      { label:'One extraction with all 30 cm³.', effect:'drain', feedback:'This works, but leaves more iodine in the water than three smaller extractions would.',
        title:'Less extracted', text:'The aqueous layer is still noticeably coloured.',
        fix:'Extract the aqueous layer again with fresh portions of solvent.', fixFeedback:'Right: repeated extractions are more efficient.' }
    ] },
  { title:'Dry the extract', effect:'drain', after:'drain',
    text:'Your combined cyclohexane extracts look slightly cloudy. What next?',
    best:['Add a little anhydrous drying agent such as magnesium sulfate, swirl, then filter it off.', 'Cloudiness is water. A drying agent removes it before the solvent is evaporated.'],
    wrong:[
      { label:'Filter it through filter paper to remove the cloudiness.', effect:'drain_bad', feedback:'Filtering removes solids, not dissolved or dispersed water. The 2025 Advanced Higher course report noted that many candidates described the wrong technique at this kind of step.',
        title:'Still wet', text:'The filtrate is still cloudy.',
        fix:'Add anhydrous magnesium sulfate, swirl, then filter.', fixFeedback:'Correct.' }
    ] }
], { title:'Iodine extracted', text:'Immiscible solvent, safe venting, clean separation, repeated extraction and drying: each step is a mark in the bank for the exam.', ref:`${SPEC_AH} ${REP_AH}` },
   { title:'Extraction failed', text:'Solvent extraction depends on every step in the right order. Try the station again.', ref:SPEC_AH });

/* ---------- E: reflux and distillation ---------- */
const reflux = scenario('reflux', 'Reflux and distillation: oxidising ethanol', [
  { title:'Set up for reflux', effect:'calm', after:'assemble',
    text:'You will oxidise ethanol to ethanoic acid with acidified potassium dichromate, heating under reflux. How do you set it up?',
    best:['A round-bottomed flask with anti-bumping granules, a vertical condenser with water in at the bottom and out at the top, the top left open, in a fume cupboard.', 'Water entering at the bottom fills the jacket completely. The open top stops pressure building, and the granules give smooth boiling.'],
    wrong:[
      { label:'Connect the water to the top of the condenser so it flows down.', effect:'assemble_bad', feedback:'Water entering at the top drains straight out without filling the jacket, so the condenser barely cools.',
        title:'Vapour escaping', text:'Ethanol vapour comes out of the top of the condenser.',
        fix:'Reconnect the water in at the bottom and out at the top.', fixFeedback:'Right.' },
      { label:'Put a stopper in the top of the condenser to keep the vapour in.', effect:'sealed', feedback:'Heating a sealed system builds up pressure. It can blow apart.',
        title:'Stop: sealed system', text:'Pressure is building in a closed apparatus being heated.',
        fix:'Turn off the heat, let it cool and remove the stopper.', fixFeedback:'Correct: never heat a closed system.',
        carry:['Keep heating; it will be fine.', 'Heating a closed system is dangerous: the apparatus can shatter.'] }
    ] },
  { title:'Choose the heat source', effect:'assemble', after:'reflux',
    text:'Ethanol is volatile and flammable. What do you heat it with?',
    best:['An electric heating mantle (or a water bath).', 'No naked flame near flammable vapour.'],
    wrong:[
      { label:'A Bunsen burner under a gauze.', effect:'bunsen_bad', feedback:'Ethanol vapour can reach the flame and ignite.',
        title:'Fire risk', text:'A naked flame is next to flammable vapour.',
        fix:'Turn off the Bunsen and use a heating mantle.', fixFeedback:'Right.' }
    ] },
  { title:'Why reflux?', effect:'reflux', after:'reflux',
    text:'The mixture has been refluxing for 30 minutes and has turned from orange to green. Why heat under reflux rather than in an open flask?',
    best:['So the mixture can be heated for a long time without volatile reactants or products escaping.', 'Vapour condenses and runs back into the flask, so nothing is lost while the reaction goes to completion.'],
    wrong:[
      { label:'To separate the product as it forms.', effect:'reflux', feedback:'That is distillation. Reflux returns everything to the flask.',
        title:'Mixed up', text:'Reflux and distillation are easy to confuse.',
        fix:'Reflux: heat for a long time without losing volatile substances.', fixFeedback:'Correct.' }
    ] },
  { title:'Set up the distillation', effect:'reflux', after:'distil',
    text:'Now you need to separate the ethanoic acid. Where does the thermometer go?',
    best:['With its bulb level with the side arm of the still head.', 'The thermometer must measure the temperature of the vapour passing into the condenser, which tells you which substance is distilling.'],
    wrong:[
      { label:'With its bulb in the boiling liquid.', effect:'distil_bad', feedback:'That measures the liquid, not the vapour that is distilling over.',
        title:'Wrong reading', text:'The temperature tells you nothing about what is collecting in the receiver.',
        fix:'Raise it so the bulb is level with the side arm.', fixFeedback:'Right.' }
    ] },
  { title:'Collect the right fraction', effect:'distil', after:'distil',
    text:'Liquid is distilling and the thermometer reads 78 °C. Ethanoic acid boils at 118 °C. What do you do?',
    best:['Collect this fraction separately and change the receiver when the temperature rises towards 118 °C.', 'At 78 °C this is unreacted ethanol. Your product comes over at its own boiling point.'],
    wrong:[
      { label:'Collect everything that comes over in the same receiver.', effect:'distil_bad', feedback:'The ethanol fraction contaminates your product.',
        title:'Impure product', text:'Your “ethanoic acid” is mixed with ethanol.',
        fix:'Start a fresh receiver when the temperature reaches the product’s boiling point.', fixFeedback:'Correct.' }
    ] }
], { title:'Product separated', text:'Reflux let the oxidation go to completion safely; distillation at the right temperature gave the product. Check its purity next: melting point, boiling point or chromatography.', ref:`${SPEC_AH} ${SPEC_H}` },
   { title:'Unsafe or impure', text:'This setup is unsafe or gives an impure product. Try the station again.', ref:SPEC_AH });

/* ---------- F: collecting a gas ---------- */
const gas = scenario('gas', 'Collecting a gas: rate and concentration', [
  { title:'Assemble the apparatus', effect:'calm', after:'fair',
    text:'You will measure how fast carbon dioxide is given off when marble chips react with hydrochloric acid. How do you set up?',
    best:['A conical flask with a bung and delivery tube connected to a gas syringe, with a stopclock.', 'A gas syringe measures the volume of gas directly. Drawing this labelled, assembled apparatus is a common exam question.'],
    wrong:[
      { label:'A delivery tube running into an open beaker of water.', effect:'gas_bad', feedback:'The gas bubbles away. Nothing measures its volume.',
        title:'Nothing measured', text:'You can see bubbles, but you have no numbers.',
        fix:'Connect the delivery tube to a gas syringe (or an inverted measuring cylinder filled with water).', fixFeedback:'Right: the gas has to be collected and measured.' }
    ] },
  { title:'Start the reaction', effect:'fair', after:'gas',
    text:'How do you start the reaction and the timing?',
    best:['Add the acid to the chips, put the bung in at once and start the stopclock at the same moment.', 'Every second of delay lets gas escape before it is measured.'],
    wrong:[
      { label:'Add the acid, start the clock, then fit the bung once everything is sorted out.', effect:'gas_lost', feedback:'Gas escapes before the bung goes in, so the early volumes are too low.',
        title:'Missing gas', text:'The first readings are far lower than they should be.',
        fix:'Repeat, putting the bung in immediately as you start the clock.', fixFeedback:'Good.' }
    ] },
  { title:'Something is wrong', effect:'leak', after:'gas',
    text:'In one run the mixture is fizzing hard, but the syringe barely moves. What do you check first?',
    best:['That the bung and tubing are fitted tightly, so the apparatus is airtight.', 'Gas escaping round the bung is the most likely cause.'],
    wrong:[
      { label:'Add more acid to speed it up.', effect:'leak', feedback:'More acid changes the concentration you are investigating and does not stop the leak.',
        title:'Still leaking', text:'The syringe still barely moves, and now the run is not a fair test.',
        fix:'Discard the run, fit the bung firmly and repeat.', fixFeedback:'Right.' }
    ] },
  { title:'Make it a fair test', effect:'gas', after:'gas',
    text:'You are changing the concentration of the acid. Which variables must you keep the same?',
    best:['The mass and size of the marble chips, the volume of acid and the temperature.', 'Only the independent variable should change. Stating the controlled variables is regularly tested.'],
    wrong:[
      { label:'Only the volume of acid.', effect:'gas_bad', feedback:'Chip size changes the surface area and temperature changes the rate, so both must be controlled too.',
        title:'Not a fair test', text:'Different chip sizes in each run make the results impossible to compare.',
        fix:'Control chip mass and size, acid volume and temperature.', fixFeedback:'Correct.' }
    ] },
  { title:'Make it reliable', effect:'gas', after:'gas',
    text:'You have one set of results for each concentration. How do you improve the reliability?',
    best:['Repeat each experiment and calculate the average.', 'Repeats show whether a result is reproducible and reduce the effect of random errors.'],
    wrong:[
      { label:'Use a more precise stopclock.', effect:'gas', feedback:'Precision is not the same as reliability. Repeating the experiment is what tests whether results can be trusted.',
        title:'Still one run', text:'A single run each still gives no idea how repeatable the results are.',
        fix:'Repeat each run and average.', fixFeedback:'Right.' }
    ] }
], { title:'A fair, reliable investigation', text:'Airtight apparatus, immediate timing, controlled variables and repeats: the full set of researching chemistry skills.', ref:`${SPEC_H} ${REP_H}` },
   { title:'Results you cannot use', text:'These results cannot support a conclusion. Try the station again.', ref:SPEC_H });

export const spec = {
  id:'practical-bench',
  title:'Practical Bench',
  subtitle:'Higher and Advanced Higher Chemistry',
  module:'Higher and Advanced Higher Chemistry · researching chemistry practice',
  moduleCode:'Chemistry',
  open:true,
  ground:G,
  seed:11,
  target:[0, 1.5, -0.3],
  fit:9.6,
  camAz:0.35,
  shadowHalf:11,
  catcherY:-5.5,
  arCatcherY:-1.24,
  pinSize:0.6,
  privacy:'Nothing you do in this model is recorded or sent anywhere. Your progress is kept only in this browser.',

  views:[
    { name:'Tabletop', s:0.07, yaw:-0.35, anchor:[0, 0, 0], at:[0, 0.82, -0.85] },
    { name:'Room scale', s:0.2, yaw:-0.35, anchor:[0, 0, 0], at:[0, 0.3, -2.4] },
    { name:'At the bench', s:0.5, yaw:0, anchor:[0, G, -0.4], at:[0, 0, 0] }
  ],

  scenarios:[titration, standard, constant, extraction, reflux, gas],

  hotspots:[
    { id:'sc-titration', n:'!', title:'Titration', pos:pin('A'), scenario:'titration', concept:'volumetric analysis',
      blurb:'Find the concentration of ethanoic acid in vinegar. Your choices change the flask and the burette.' },
    { id:'sc-reflux', n:'!', title:'Reflux and distillation', pos:pin('E', 3.4), scenario:'reflux', concept:'reflux, distillation and safe heating',
      blurb:'Oxidise ethanol under reflux, then distil off the product, in the fume cupboard.' },
    { id:'sc-constant', n:'!', title:'Heating to constant mass', pos:pin('C'), scenario:'constant', concept:'gravimetric analysis',
      blurb:'Find the water of crystallisation in hydrated barium chloride.' },
    { id:'sc-standard', n:'!', title:'Standard solution', pos:pin('B', 2.4), scenario:'standard', concept:'primary standards and volumetric flasks',
      blurb:'Make 250 cm³ of a solution of accurately known concentration.' },
    { id:'sc-extraction', n:'!', title:'Solvent extraction', pos:pin('D', 2.6), scenario:'extraction', concept:'separating funnels and immiscible solvents',
      blurb:'Extract iodine from water, then dry the extract.' },
    { id:'sc-gas', n:'!', title:'Collecting a gas', pos:pin('F', 2.4), scenario:'gas', concept:'rates, fair tests and apparatus',
      blurb:'Measure carbon dioxide from marble chips and acid, and make it a fair test.' },
    { id:'risk', n:1, title:'Risk assessment', pos:[-7.4, 3.3, 0.4], concept:'hazards, risks and control measures',
      blurb:'The safety equipment on the wall is your reminder: a risk assessment needs specific hazards, with concentrations and states.' },
    { id:'apparatus', n:2, title:'Choosing apparatus', pos:[-2.2, BTpos(1.6), -2.3], concept:'accuracy of glassware',
      blurb:'Burette, pipette, volumetric flask, measuring cylinder: which to use, and why.' },
    { id:'results', n:3, title:'Results and uncertainty', pos:[2.2, BTpos(1.6), 2.4], concept:'processing data and uncertainties',
      blurb:'Concordant results, averages and percentage uncertainty.' },
    { id:'evaluate', n:4, title:'Evaluating', pos:[6.9, BTpos(2.0), -1.6], concept:'graphs, literature comparison and evaluation',
      blurb:'How to compare with a literature value and evaluate a procedure so that it earns marks.' }
  ],

  questions:[
    { id:'r1', hotspot:'risk', q:'A risk assessment lists “sodium hydroxide: corrosive” for a 0.10 mol l⁻¹ solution. What should be improved?',
      options:['Nothing: sodium hydroxide solution is corrosive at every concentration you might use', 'Give the concentration and state; a solution this dilute is classed as an irritant', 'Remove it: dilute solutions never need to appear in a risk assessment at all', 'Add that it is also flammable, because alkalis react with air when they are heated'], answer:1,
      explain:'Hazards depend on concentration and state. The 2025 Advanced Higher course report noted that many candidates exaggerated the hazards of dilute solutions and gave hazards without concentrations or states. Check the school’s hazard data (for example CLEAPSS Hazcards) for the exact classification.', ref:REP_AH },
    { id:'r2', hotspot:'risk', q:'Phenolphthalein indicator is usually supplied dissolved in ethanol. Which hazard is most often left out of risk assessments?',
      options:['It is toxic if touched', 'It is flammable', 'It is corrosive', 'It is radioactive'], answer:1,
      explain:'The ethanol solvent makes the indicator solution flammable, so keep it away from naked flames. The 2025 Advanced Higher course report noted that the flammability of indicators was often not recorded.', ref:REP_AH },
    { id:'a1', hotspot:'apparatus', q:'Which piece of apparatus delivers 25.0 cm³ of a solution most accurately?',
      options:['Measuring cylinder', 'Beaker', 'Pipette', 'Conical flask'], answer:2,
      explain:'A pipette (used with a filler) is calibrated to deliver a fixed volume accurately. Measuring cylinders and beakers are much less accurate.', ref:SPEC_H },
    { id:'a2', hotspot:'apparatus', q:'Why is a white tile put under the conical flask during a titration?',
      options:['To protect the bench from spills', 'To keep the flask cool', 'To make the colour change easier to see', 'To catch drops from the burette'], answer:2,
      explain:'Against white, the first permanent colour change is much easier to spot.', ref:SPEC_H },
    { id:'d1', hotspot:'results', q:'Titres: 22.60 (rough), 22.10, 22.35, 22.15 cm³. Which value should be used in the calculation?',
      options:['22.30 cm³', '22.13 cm³', '22.20 cm³', '22.35 cm³'], answer:1,
      explain:'22.10 and 22.15 cm³ are concordant; 22.35 cm³ is not, and the rough titre is never used. (22.10 + 22.15) / 2 = 22.125, which is 22.13 cm³.', ref:SPEC_H },
    { id:'d2', hotspot:'results', q:'A 25.0 cm³ pipette has an uncertainty of ±0.06 cm³. What is its percentage uncertainty?',
      options:['0.06%', '0.24%', '2.4%', '4.2%'], answer:1,
      explain:'0.06 / 25.0 × 100 = 0.24%.', ref:SPEC_AH },
    { id:'d3', hotspot:'results', q:'You weigh 0.50 g on a balance reading to ±0.01 g, deliver 25.0 ± 0.06 cm³ with a pipette and record a titre of 15.00 ± 0.05 cm³. Which has the largest percentage uncertainty?',
      options:['The pipette volume', 'The titre', 'The mass', 'They are all the same'], answer:2,
      explain:'Mass 0.01 / 0.50 = 2%; titre 0.05 / 15.00 = 0.33%; pipette 0.24%. The mass dominates, so weighing a larger mass would improve the result most.', ref:SPEC_AH },
    { id:'e1', hotspot:'evaluate', q:'The literature value is 0.80 mol l⁻¹ and a pupil found 0.74 mol l⁻¹. Which comparison earns credit?',
      options:['“My result is quite close to the literature value, so the method worked well.”', '“My result is lower than the literature value, by 0.06 mol l⁻¹ (7.5%).”', '“My result was different because of human error during the titrations.”', '“The literature value must be out of date, since my method was accurate.”'], answer:1,
      explain:'A valid comparison says whether the result is higher or lower, and by how much. The course reports note that comparisons often do not say which.', ref:`${REP_H} ${REP_AH}` },
    { id:'e2', hotspot:'evaluate', q:'A pupil measured the rate of reaction at five acid concentrations. Which graph should they draw?',
      options:['A bar chart with one bar for each concentration used', 'A pie chart showing the share of the total rate at each one', 'A scatter graph of rate against concentration with a line of best fit', 'A results table only, because graphs are not needed for rates'], answer:2,
      explain:'Both variables are continuous, so plot a line graph with a line or curve of best fit. The 2025 Advanced Higher course report says bar charts are highly unlikely to be appropriate.', ref:REP_AH },
    { id:'e3', hotspot:'evaluate', q:'A pupil did two runs of an experiment. What is the best way to process them?',
      options:['Average the raw readings from both runs first, then do one calculation', 'Do the full calculation for each run, then compare and average the final results', 'Use only the run that looks better and ignore the other one entirely', 'Average the two runs only if their raw readings are exactly identical'], answer:1,
      explain:'Processing each run separately shows how repeatable the final result is. The 2025 Advanced Higher course report notes that averaging raw duplicates first limits access to data analysis marks.', ref:REP_AH }
  ]
};

function BTpos(dy){ return G + 1.0 + dy; }
