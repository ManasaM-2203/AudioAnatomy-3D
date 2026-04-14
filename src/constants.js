export const EAR_PARTS = [
  { id: 'pinna', name: 'Pinna (Outer Ear)', description: 'The outer part of the ear that gathers sound waves and directs them into the ear canal.' },
  { id: 'canal', name: 'Ear Canal', description: 'A tube running from the outer ear to the middle ear.' },
  { id: 'eardrum', name: 'Eardrum (Tympanic Membrane)', description: 'A thin membrane that vibrates when sound waves hit it.' },
  { id: 'ossicles', name: 'Ossicles', description: 'Three small bones (malleus, incus, stapes) that amplify vibrations.' },
  { id: 'cochlea', name: 'Cochlea', description: 'A snail-shaped structure filled with fluid that converts vibrations into nerve impulses.' },
  { id: 'nerve', name: 'Auditory Nerve', description: 'Carries electrical signals from the cochlea to the brain.' }
];

export const SIMULATION_STEPS = [
  { step: 0, partId: 'none', title: 'Hearing Simulation', description: 'Click Next to begin the journey of sound through the ear.' },
  { step: 1, partId: 'pinna', title: '1. Gathering Sound', description: 'Sound waves are collected by the Pinna and funneled inwards.' },
  { step: 2, partId: 'canal', title: '2. Ear Canal', description: 'The sound waves pass through the ear canal to reach the middle ear.' },
  { step: 3, partId: 'eardrum', title: '3. Vibrating Eardrum', description: 'Sound waves strike the flexible eardrum, causing it to vibrate.' },
  { step: 4, partId: 'ossicles', title: '4. Amplification', description: 'Vibrations are amplified by three tiny bones: Malleus, Incus, and Stapes.' },
  { step: 5, partId: 'cochlea', title: '5. Cochlear Waves', description: 'The stapes pushes on the fluid-filled cochlea, turning mechanical energy into fluid waves.' },
  { step: 6, partId: 'nerve', title: '6. Brain Signals', description: 'Hair cells inside the cochlea convert fluid waves into electrical signals sent via the Auditory Nerve.' }
];
