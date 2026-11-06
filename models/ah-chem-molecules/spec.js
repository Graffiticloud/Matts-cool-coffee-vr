/* Content and settings for the AH Chemistry molecules model. The scene lives in scene.js, shared positions in layout.js.
   open:true makes this an anonymous model for school use: no student number, no scores sent anywhere, no research
   capture and no AI tutor. Answers are marked in the page because this is revision, not assessment. */
import { G, pinPos } from './layout.js';

const SPEC = 'Qualifications Scotland (2026) Advanced Higher Chemistry, SCQF level 7: course specification. Version 4.0. Available at: https://www.sqa.org.uk/sqa/files_ccc/ah-course-spec-chemistry.pdf (Accessed: 6 November 2026).';
const ref = area => `${SPEC} Key area: ${area}.`;

export const spec = {
  id:'ah-chem-molecules',
  title:'Molecules in 3D',
  subtitle:'Advanced Higher Chemistry',
  module:'Advanced Higher Chemistry (C813 77) · shapes, orbitals, isomers and mechanisms',
  moduleCode:'AH Chemistry',
  open:true,
  ground:G,
  seed:5,
  target:[0, 1.2, 0],
  fit:9.8,
  camAz:0.32,
  shadowHalf:11,
  catcherY:-5.5,
  arCatcherY:-1.24,
  pinSize:0.6,
  privacy:'Nothing you do in this model is recorded or sent anywhere. Your progress is kept only in this browser.',

  views:[
    { name:'Tabletop', s:0.07, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.82, -0.85] },
    { name:'Room scale', s:0.2, yaw:-Math.PI / 4, anchor:[0, 0, 0], at:[0, 0.3, -2.4] },
    { name:'Among the molecules', s:0.6, yaw:0, anchor:[0, G, 0], at:[0, 0, 0] }
  ],

  hotspots:[
    { id:'orbitals', n:1, title:'Atomic orbitals', pos:pinPos('orbitals'), concept:'quantum numbers, orbital shapes, aufbau, Hund and Pauli',
      blurb:'A 1s orbital, the three degenerate 2p orbitals (one per axis) and a four-lobed 3d orbital, each around its nucleus.' },
    { id:'vsepr', n:2, title:'Electron pairs and shape', pos:pinPos('vsepr'), concept:'VSEPR theory',
      blurb:'Ammonia, with three bonding pairs and one non-bonding pair (yellow), beside octahedral sulfur hexafluoride.' },
    { id:'complex', n:3, title:'A transition metal complex', pos:pinPos('complex'), concept:'ligands, d-orbital splitting and colour',
      blurb:'Six water ligands around a Cu²⁺ ion. Beside it, the split d orbitals: a photon is absorbed and an electron is promoted, then falls back.' },
    { id:'ethene', n:4, title:'Ethene', pos:pinPos('ethene'), concept:'sp² hybridisation, σ and π bonds',
      blurb:'Ethene’s flat σ framework, with the π bond as a teal cloud above and below the plane of the molecule.' },
    { id:'benzene', n:5, title:'Benzene', pos:pinPos('benzene'), concept:'delocalisation and aromatic stability',
      blurb:'A ring of six sp² carbons. The teal rings above and below are the delocalised π system spread over all six atoms.' },
    { id:'geometric', n:6, title:'Cis and trans isomers', pos:pinPos('geometric'), concept:'geometric isomerism',
      blurb:'cis-but-2-ene (left) and trans-but-2-ene (right): the same atoms in the same order, held differently about a double bond.' },
    { id:'enantiomers', n:7, title:'Mirror-image molecules', pos:pinPos('enantiomers'), concept:'chirality and optical isomerism',
      blurb:'The two enantiomers of 2-hydroxypropanoic (lactic) acid on either side of a mirror. They move as mirror images too.' },
    { id:'sn2', n:8, title:'An SN2 reaction', pos:pinPos('sn2'), concept:'nucleophilic substitution mechanisms',
      blurb:'Hydroxide (orange glow: negative charge) attacks bromomethane from the side opposite the bromine, passes through a five-centred transition state, and bromide leaves. Watch the hydrogens flip like an umbrella.' }
  ],

  questions:[
    { id:'q1', hotspot:'orbitals', q:'An electron is in a 3d orbital. Which set of values for n, l and mₗ is possible for it?',
      options:['n = 3, l = 3, mₗ = −2', 'n = 2, l = 2, mₗ = 0', 'n = 3, l = 2, mₗ = −1', 'n = 3, l = 2, mₗ = 3'], answer:2,
      explain:'A d subshell has l = 2, and mₗ runs from −l to +l, so −2, −1, 0, +1 or +2: five d orbitals. l can only be 0 to n − 1, so l = 3 is impossible when n = 3, and the n = 2 shell has no d subshell.',
      ref:ref('atomic orbitals, electronic configurations and the periodic table') },
    { id:'q2', hotspot:'orbitals', q:'How are the two 2p electrons of a carbon atom arranged in its ground state?',
      options:['Paired in one 2p orbital, with parallel spins', 'One in each of two 2p orbitals, with parallel spins', 'One in each of two 2p orbitals, with opposite spins', 'Paired in one 2p orbital, with opposite spins'], answer:1,
      explain:'Hund’s rule: degenerate orbitals fill singly, with spins parallel, before any pairing starts. Two electrons in one orbital must have opposite spins (Pauli exclusion principle), but that arrangement is higher in energy here.',
      ref:ref('atomic orbitals, electronic configurations and the periodic table') },

    { id:'q3', hotspot:'vsepr', q:'Ammonia has four electron pairs around nitrogen, yet its H–N–H angle is about 107°, not 109.5°. Why?',
      options:['Bonding pair/bonding pair repulsion is stronger than any other kind of repulsion', 'Nitrogen is sp² hybridised, so its three bonds lie closer together than in methane', 'The hydrogen atoms attract each other weakly, which pulls the bonds closer together', 'Non-bonding/bonding pair repulsion is stronger than bonding/bonding pair repulsion'], answer:3,
      explain:'The order is non-bonding/non-bonding > non-bonding/bonding > bonding/bonding. The non-bonding pair (the yellow lobe) pushes the three N–H bonds closer together, so the tetrahedral arrangement of pairs gives a trigonal pyramidal molecule with a smaller angle.',
      ref:ref('atomic orbitals, electronic configurations and the periodic table (VSEPR)') },
    { id:'q4', hotspot:'vsepr', q:'Using VSEPR, how many electron pairs surround sulfur in SF₄, and how are they arranged?',
      options:['4 pairs, arranged tetrahedrally around sulfur', '5 pairs, arranged trigonal bipyramidally', '6 pairs, arranged octahedrally', '5 pairs, arranged square pyramidally'], answer:1,
      explain:'Sulfur has 6 outer electrons; add 1 for each of the 4 fluorine atoms to give 10, so 5 pairs (4 bonding, 1 non-bonding). Five pairs are arranged trigonal bipyramidally. In SF₆ there are 6 + 6 = 12 electrons, so 6 pairs: octahedral, as in the model.',
      ref:ref('atomic orbitals, electronic configurations and the periodic table (VSEPR)') },

    { id:'q5', hotspot:'complex', q:'A solution of [Cu(H₂O)₆]²⁺ absorbs light mainly from the orange-red part of the spectrum. Why does it look blue?',
      options:['Electrons fall from upper to lower d orbitals and give out blue light as they do so', 'The 4s electrons absorb orange-red light, because the 3d subshell of Cu²⁺ is completely full', 'Electrons promoted between split d orbitals absorb orange-red; the complementary colour is seen', 'The water ligands absorb every visible colour except blue, which passes straight through the ion'], answer:2,
      explain:'The ligands split the d orbitals. A d–d transition absorbs a photon whose energy matches the gap, here in the orange-red, and we see the complementary colour. Cu²⁺ is 3d⁹ (the 4s electrons are lost first), so there is a gap in the upper set for an electron to move into.',
      ref:ref('transition metals') },
    { id:'q6', hotspot:'complex', q:'What is the systematic name of [Cu(H₂O)₆]²⁺, and what is the coordination number of copper in it?',
      options:['hexaaquacuprate(II) ion; coordination number 6', 'hexaaquacopper(II) ion; coordination number 2', 'hexahydroxocopper(II) ion; coordination number 6', 'hexaaquacopper(II) ion; coordination number 6'], answer:3,
      explain:'Water as a ligand is “aqua”, and six of them make “hexaaqua”. The ending “cuprate” is only used when the complex is a negative ion. Each water donates one pair of electrons (monodentate), so six dative bonds give coordination number 6.',
      ref:ref('transition metals') },

    { id:'q7', hotspot:'ethene', q:'How is the carbon–carbon double bond in ethene made up?',
      options:['Two σ bonds, both from end-on overlap of the sp² hybrid orbitals on each carbon', 'One σ bond from end-on overlap of sp² hybrids and one π bond from side-on overlap of 2p orbitals', 'One σ bond from side-on overlap of 2p orbitals and one π bond from end-on overlap of the sp² hybrids', 'One σ bond from end-on overlap of sp³ hybrids and one π bond from side-on overlap of 2s orbitals'], answer:1,
      explain:'Each carbon mixes 2s with two 2p orbitals to give three sp² hybrids in a trigonal plane; these overlap end-on to form σ bonds. The remaining unhybridised 2p orbitals overlap side-on, above and below the plane, to form the π bond (the teal cloud).',
      ref:ref('molecular orbitals') },
    { id:'q8', hotspot:'ethene', q:'Ethene is colourless, but β-carotene, with a long chain of alternating single and double bonds, is orange. Why?',
      options:['β-carotene’s larger conjugated system raises its HOMO–LUMO gap, so it absorbs visible light', 'Ethene has the smaller HOMO–LUMO gap, so it absorbs only infrared radiation and looks colourless', 'β-carotene contains transition metal ions, and their d–d transitions absorb visible light', 'β-carotene’s larger conjugated system lowers its HOMO–LUMO gap, so it absorbs visible light'], answer:3,
      explain:'The more atoms in a conjugated system, the smaller the HOMO–LUMO gap and the longer the wavelength absorbed. Ethene’s gap is large, so it absorbs in the ultraviolet. β-carotene’s long chromophore absorbs blue-green visible light, and we see the complementary orange.',
      ref:ref('molecular orbitals') },

    { id:'q9', hotspot:'benzene', q:'Why does benzene usually take part in substitution rather than addition reactions?',
      options:['Benzene has no π electrons, so an electrophile cannot be attracted to its ring', 'Its carbon atoms are sp³ hybridised, so they cannot form any further bonds', 'Addition would break up the delocalised π system and lose its extra stability', 'Substitution breaks up the delocalised π system, which lowers the ring’s energy'], answer:2,
      explain:'The six p electrons are delocalised over the whole ring, which makes benzene unusually stable. Substitution replaces a hydrogen and keeps the delocalised system intact; addition would destroy it.',
      ref:ref('synthesis (benzene and aromatic reactions)') },
    { id:'q10', hotspot:'benzene', q:'Which reagents are used to nitrate benzene?',
      options:['Concentrated nitric acid with concentrated sulfuric acid', 'Dilute nitric acid with aluminium chloride as a catalyst', 'Concentrated nitric acid with an iron(III) bromide catalyst', 'Sodium nitrate dissolved in ethanol, heated under reflux'], answer:0,
      explain:'A mixture of concentrated nitric and sulfuric acids produces the electrophile NO₂⁺, which substitutes onto the ring to give nitrobenzene. Aluminium and iron(III) halides are used for halogenation and alkylation.',
      ref:ref('synthesis (benzene and aromatic reactions)') },

    { id:'q11', hotspot:'geometric', q:'Why can but-2-ene exist as cis and trans isomers when but-1-ene cannot?',
      options:['But-1-ene can rotate freely about its carbon–carbon double bond at room temperature', 'One carbon of but-1-ene’s double bond carries two identical H atoms', 'But-1-ene has no double bond, so nothing restricts its rotation', 'Both carbons of but-2-ene’s double bond carry two identical groups'], answer:1,
      explain:'Geometric isomers need restricted rotation and two different groups on each carbon of that bond. In but-1-ene, CH₂=CH–CH₂CH₃, the first carbon has two hydrogens, so swapping them gives the same molecule.',
      ref:ref('stereo chemistry') },
    { id:'q12', hotspot:'geometric', q:'How do cis-but-2-ene and trans-but-2-ene differ?',
      options:['They rotate plane-polarised light in opposite directions', 'They have different molecular formulae', 'They are structural isomers with atoms bonded in a different order', 'They have different physical properties, such as boiling point'], answer:3,
      explain:'They are stereoisomers: the same atoms bonded in the same order but arranged differently in space. Geometric isomers differ in physical properties such as melting and boiling point, and can differ chemically. Rotating plane-polarised light is a property of optical isomers.',
      ref:ref('stereo chemistry') },

    { id:'q13', hotspot:'enantiomers', q:'Why does 2-hydroxypropanoic (lactic) acid have optical isomers?',
      options:['Its carboxyl carbon is trigonal planar, so its mirror images cannot be superimposed', 'Its central carbon carries two identical groups, which gives it a plane of symmetry', 'Its central carbon has four different groups, so its mirror images cannot be superimposed', 'Restricted rotation about a carbon–carbon double bond holds its groups in place'], answer:2,
      explain:'The central carbon carries H, OH, CH₃ and COOH: four different groups arranged tetrahedrally, so it is a chiral centre. Its mirror image cannot be superimposed on it, however you turn it. Watch the two models swing as reflections of each other.',
      ref:ref('stereo chemistry') },
    { id:'q14', hotspot:'enantiomers', q:'A sample contains equal amounts of both enantiomers of lactic acid. What happens to plane-polarised light passed through it?',
      options:['It is rotated by twice the angle that either enantiomer gives on its own', 'There is no overall rotation: the equal and opposite rotations cancel', 'It is rotated to the right, because the mixture is chiral overall', 'There is no rotation, because enantiomers never affect plane-polarised light'], answer:1,
      explain:'Each enantiomer rotates plane-polarised light by the same amount in opposite directions. In an equal mixture, a racemic mixture, the effects cancel, so it is optically inactive.',
      ref:ref('stereo chemistry') },

    { id:'q15', hotspot:'sn2', q:'Bromomethane reacts with hydroxide ions by an SN2 mechanism. Which rate equation fits this?',
      options:['rate = k[CH₃Br]', 'rate = k[OH⁻]', 'rate = k[CH₃Br]²[OH⁻]', 'rate = k[CH₃Br][OH⁻]'], answer:3,
      explain:'SN2 has two species in the rate-determining step: the haloalkane and the nucleophile collide in a single step through one five-centred, trigonal bipyramidal transition state. So the reaction is first order in each and second order overall.',
      ref:ref('synthesis (haloalkanes and SN1/SN2)') },
    { id:'q16', hotspot:'sn2', q:'Why do tertiary haloalkanes usually react by SN1 rather than SN2?',
      options:['Steric hindrance blocks backside attack, and three alkyl groups stabilise the carbocation inductively', 'Tertiary haloalkanes react only with weak nucleophiles, so the nucleophile is left out of the rate equation', 'Their carbon–halogen bond is non-polar, so it breaks homolytically into radicals rather than ions', 'Primary carbocations are more stable, so tertiary haloalkanes must react through a transition state instead'], answer:0,
      explain:'In SN2 the nucleophile must reach the carbon from the side opposite the halogen, which three bulky alkyl groups block. In SN1 the halide leaves first to give a trigonal planar carbocation, and three alkyl groups stabilise that positive charge by their inductive effect.',
      ref:ref('synthesis (haloalkanes and SN1/SN2)') }
  ]
};
