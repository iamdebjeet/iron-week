// Swim session: Mon (recovery), Wed and Fri (after leg day)
import type { MuscleUse, SwimBlock } from './types';

export const SWIM_DAYS: string[] = [
  "mon",
  "wed",
  "fri"
];

export const SWIM_BLOCKS: SwimBlock[] = [
  {
    "name": "Warm-up",
    "minutes": 5,
    "text": "Easy swim, any stroke. Slow and relaxed; focus on breathing out under water."
  },
  {
    "name": "Technique drills",
    "minutes": 8,
    "text": "Alternate lengths: kickboard kicking (legs only), then freestyle breathing to the side every 3 strokes."
  },
  {
    "name": "Main swim",
    "minutes": 20,
    "text": "Freestyle or breaststroke lengths at an easy to moderate pace. Rest 20–30 sec at the wall whenever you need it. You should be able to talk after each length."
  },
  {
    "name": "Cool-down",
    "minutes": 5,
    "text": "Very slow backstroke or breaststroke, then a light shoulder and chest stretch at the poolside."
  }
];

export const SWIM_MUSCLES: MuscleUse = {
  "main": [
    "Back",
    "Shoulders"
  ],
  "helps": [
    "Triceps",
    "Abs & core",
    "Glutes",
    "Quads"
  ]
};
