// Stretch and mobility library plus each day's warm-up (w) and cool-down (c) lists
import type { Stretch } from './types';

export const STRETCHES: Record<string, Stretch> = {
  "jj": {
    "name": "Jumping Jacks",
    "type": "time",
    "value": 60,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Jump feet out wide while raising arms overhead.",
      "Jump back to feet together, arms down.",
      "Keep a steady rhythm and land softly."
    ],
    "area": "Cardio",
    "muscles": []
  },
  "armc": {
    "name": "Arm Circles",
    "type": "reps",
    "value": 15,
    "sides": 2,
    "pace": 1.5,
    "cues": [
      "Arms straight out to the sides at shoulder height.",
      "Make circles, small to big.",
      "Side 1 forward, side 2 backward."
    ],
    "area": "Shoulders",
    "muscles": [
      "Shoulders"
    ]
  },
  "bandpa": {
    "name": "Band Pull-Apart",
    "type": "reps",
    "value": 15,
    "sides": 1,
    "pace": 2,
    "cues": [
      "Hold a light band in front at chest height, arms straight.",
      "Pull the band apart until it touches your chest.",
      "Squeeze shoulder blades, return slowly."
    ],
    "area": "Upper back",
    "muscles": [
      "Back",
      "Shoulders"
    ]
  },
  "thor": {
    "name": "Open Book Thoracic Rotation",
    "type": "reps",
    "value": 8,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your side, knees bent, arms together in front.",
      "Open the top arm over to the other side, following it with your eyes.",
      "Pause, then close back. Keep knees together."
    ],
    "area": "Spine",
    "muscles": [
      "Back"
    ]
  },
  "catcow": {
    "name": "Cat-Cow",
    "type": "reps",
    "value": 10,
    "sides": 1,
    "pace": 4,
    "cues": [
      "On hands and knees, hands under shoulders.",
      "Breathe in: drop the belly and lift the head (cow).",
      "Breathe out: round the back and tuck the chin (cat)."
    ],
    "area": "Spine",
    "muscles": [
      "Back",
      "Lower back"
    ]
  },
  "inch": {
    "name": "Inchworm",
    "type": "reps",
    "value": 6,
    "sides": 1,
    "pace": 8,
    "cues": [
      "Stand, bend forward and put hands on the floor.",
      "Walk hands out to a plank.",
      "Walk feet up to your hands and stand up."
    ],
    "area": "Full body",
    "muscles": [
      "Hamstrings",
      "Shoulders",
      "Abs & core"
    ]
  },
  "legfb": {
    "name": "Leg Swings (Front-Back)",
    "type": "reps",
    "value": 12,
    "sides": 2,
    "pace": 1.5,
    "cues": [
      "Hold a wall or rack for balance.",
      "Swing one leg forward and back, relaxed.",
      "Keep the upper body tall."
    ],
    "area": "Hamstrings & hips",
    "muscles": [
      "Hamstrings",
      "Hips"
    ]
  },
  "legss": {
    "name": "Leg Swings (Side-to-Side)",
    "type": "reps",
    "value": 12,
    "sides": 2,
    "pace": 1.5,
    "cues": [
      "Face the wall, hands on it.",
      "Swing one leg across your body and out to the side.",
      "Keep hips facing the wall."
    ],
    "area": "Hips & groin",
    "muscles": [
      "Hips"
    ]
  },
  "hipc": {
    "name": "Hip Circles",
    "type": "reps",
    "value": 10,
    "sides": 2,
    "pace": 2,
    "cues": [
      "Stand on one leg holding support.",
      "Lift the other knee and draw big circles with it.",
      "Side 1 one direction, side 2 the other."
    ],
    "area": "Hips",
    "muscles": [
      "Hips"
    ]
  },
  "bwsq": {
    "name": "Bodyweight Squat",
    "type": "reps",
    "value": 12,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Feet shoulder width, arms forward.",
      "Sit down to parallel, chest up.",
      "Stand up through the whole foot."
    ],
    "area": "Legs",
    "muscles": [
      "Quads",
      "Glutes"
    ]
  },
  "wgs": {
    "name": "World's Greatest Stretch",
    "type": "reps",
    "value": 5,
    "sides": 2,
    "pace": 8,
    "cues": [
      "Step into a long lunge, hand on the floor inside the front foot.",
      "Rotate the inside arm up to the ceiling.",
      "Bring it back down and repeat."
    ],
    "area": "Full body",
    "muscles": [
      "Hips",
      "Hamstrings",
      "Back"
    ]
  },
  "glbr": {
    "name": "Glute Bridge",
    "type": "reps",
    "value": 12,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Lie on your back, knees bent, feet flat.",
      "Lift hips until the body is straight from knees to shoulders.",
      "Squeeze glutes, lower slowly."
    ],
    "area": "Glutes",
    "muscles": [
      "Glutes",
      "Hamstrings"
    ]
  },
  "door": {
    "name": "Doorway Chest Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Forearm on a door frame or rack, elbow at shoulder height.",
      "Step through gently until you feel the chest stretch.",
      "Keep shoulders down and breathe."
    ],
    "area": "Chest",
    "muscles": [
      "Chest",
      "Shoulders"
    ]
  },
  "xbody": {
    "name": "Cross-Body Shoulder Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Bring one arm straight across your chest.",
      "Pull it closer with the other hand at the elbow.",
      "Keep the shoulder down, away from the ear."
    ],
    "area": "Shoulders",
    "muscles": [
      "Shoulders",
      "Back"
    ]
  },
  "ohtri": {
    "name": "Overhead Triceps Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Raise one arm and bend the elbow, hand behind your head.",
      "Gently press the elbow with the other hand.",
      "Stand tall, don't arch the back."
    ],
    "area": "Triceps",
    "muscles": [
      "Triceps",
      "Back"
    ]
  },
  "neck": {
    "name": "Neck Side Stretch",
    "type": "hold",
    "value": 20,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Sit or stand tall, shoulders relaxed.",
      "Tilt your ear toward your shoulder.",
      "Light hand pressure only. Never force it."
    ],
    "area": "Neck",
    "muscles": [
      "Neck"
    ]
  },
  "child": {
    "name": "Child's Pose",
    "type": "hold",
    "value": 45,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Kneel, sit back on your heels.",
      "Reach arms forward on the floor, forehead down.",
      "Breathe slowly into your back."
    ],
    "area": "Back",
    "muscles": [
      "Back",
      "Lower back"
    ]
  },
  "cobra": {
    "name": "Cobra Stretch",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Lie face down, hands under shoulders.",
      "Push up gently, hips stay on the floor.",
      "Relax the glutes, look forward."
    ],
    "area": "Lower back",
    "muscles": [
      "Abs & core",
      "Lower back"
    ]
  },
  "twist": {
    "name": "Seated Spinal Twist",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Sit with legs straight, cross one foot over the other knee.",
      "Twist toward the bent knee, opposite elbow outside it.",
      "Sit tall, breathe and twist a little more each breath."
    ],
    "area": "Spine",
    "muscles": [
      "Back",
      "Glutes"
    ]
  },
  "lat": {
    "name": "Kneeling Lat Stretch",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Kneel facing a bench, elbows on the bench.",
      "Sit hips back and let your chest sink down.",
      "Feel the stretch along the sides of your back."
    ],
    "area": "Lats",
    "muscles": [
      "Back"
    ]
  },
  "bicep": {
    "name": "Wall Biceps Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Place your palm on a wall behind you at shoulder height, arm straight.",
      "Slowly turn your body away from the wall.",
      "Stop when you feel the stretch in the biceps and chest."
    ],
    "area": "Biceps",
    "muscles": [
      "Biceps",
      "Chest"
    ]
  },
  "k2c": {
    "name": "Lying Knee-to-Chest",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your back.",
      "Pull one knee to your chest with both hands.",
      "Keep the other leg relaxed on the floor."
    ],
    "area": "Lower back",
    "muscles": [
      "Lower back",
      "Glutes"
    ]
  },
  "quad": {
    "name": "Standing Quad Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Stand on one leg, hold support if needed.",
      "Pull the other heel toward your glute.",
      "Knees together, hips pushed slightly forward."
    ],
    "area": "Quads",
    "muscles": [
      "Quads"
    ]
  },
  "ham": {
    "name": "Seated Hamstring Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Sit with one leg straight, the other foot against the inner thigh.",
      "Reach toward the toes of the straight leg.",
      "Keep the back flat; bend from the hips."
    ],
    "area": "Hamstrings",
    "muscles": [
      "Hamstrings"
    ]
  },
  "hipf": {
    "name": "Kneeling Hip Flexor Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Kneel on one knee, other foot in front.",
      "Squeeze the glute of the back leg and push hips forward.",
      "Keep the upper body tall."
    ],
    "area": "Hip flexors",
    "muscles": [
      "Hips",
      "Quads"
    ]
  },
  "fig4": {
    "name": "Figure-4 Glute Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your back, cross one ankle over the other knee.",
      "Pull the bottom thigh toward your chest.",
      "Feel it in the glute of the crossed leg."
    ],
    "area": "Glutes",
    "muscles": [
      "Glutes"
    ]
  },
  "fly": {
    "name": "Butterfly Stretch",
    "type": "hold",
    "value": 45,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Sit, soles of the feet together, knees out.",
      "Hold your feet and sit tall.",
      "Gently press knees down with elbows."
    ],
    "area": "Groin",
    "muscles": [
      "Hips"
    ]
  },
  "calf": {
    "name": "Wall Calf Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Hands on a wall, one foot back with leg straight.",
      "Press the back heel into the floor.",
      "Lean in until you feel the calf stretch."
    ],
    "area": "Calves",
    "muscles": [
      "Calves"
    ]
  },
  "highk": {
    "name": "High Knees",
    "type": "time",
    "value": 45,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Jog on the spot, driving knees up to hip height.",
      "Pump your arms.",
      "Stay light on the balls of your feet."
    ],
    "area": "Cardio",
    "muscles": []
  },
  "shroll": {
    "name": "Shoulder Rolls",
    "type": "reps",
    "value": 15,
    "sides": 2,
    "pace": 1.5,
    "cues": [
      "Stand tall, arms relaxed.",
      "Roll shoulders up, back and down in big circles.",
      "Side 1 backward, side 2 forward."
    ],
    "area": "Shoulders",
    "muscles": [
      "Shoulders",
      "Traps"
    ]
  },
  "scap": {
    "name": "Wall Slides",
    "type": "reps",
    "value": 10,
    "sides": 1,
    "pace": 4,
    "cues": [
      "Back against a wall, arms in a W shape touching the wall.",
      "Slide arms up into a Y, keeping contact with the wall.",
      "Slide back down and squeeze shoulder blades."
    ],
    "area": "Upper back",
    "muscles": [
      "Back",
      "Shoulders"
    ]
  },
  "torso": {
    "name": "Torso Twists",
    "type": "reps",
    "value": 15,
    "sides": 1,
    "pace": 1.5,
    "cues": [
      "Stand with feet wide, arms bent at chest height.",
      "Rotate your upper body left and right.",
      "Let the hips turn slightly; keep it smooth."
    ],
    "area": "Spine",
    "muscles": [
      "Abs & core",
      "Back"
    ]
  },
  "birddog": {
    "name": "Bird Dog",
    "type": "reps",
    "value": 8,
    "sides": 2,
    "pace": 4,
    "cues": [
      "On hands and knees, back flat.",
      "Reach one arm forward and the opposite leg back.",
      "Hold 2 seconds, return, then the other side."
    ],
    "area": "Core & spine",
    "muscles": [
      "Abs & core",
      "Lower back"
    ]
  },
  "lunge": {
    "name": "Reverse Lunge with Reach",
    "type": "reps",
    "value": 6,
    "sides": 2,
    "pace": 4,
    "cues": [
      "Step one foot back into a lunge.",
      "Reach both arms overhead and lean slightly away from the back leg.",
      "Step back up and repeat."
    ],
    "area": "Legs & hips",
    "muscles": [
      "Quads",
      "Hips"
    ]
  },
  "ankle": {
    "name": "Ankle Rolls",
    "type": "reps",
    "value": 10,
    "sides": 2,
    "pace": 1.5,
    "cues": [
      "Stand on one leg, hold support.",
      "Lift the other foot and draw circles with the toes.",
      "Go both directions."
    ],
    "area": "Ankles",
    "muscles": [
      "Calves"
    ]
  },
  "trap": {
    "name": "Upper Trap Stretch",
    "type": "hold",
    "value": 20,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Sit on your hand on one side to keep that shoulder down.",
      "Tilt your head away and slightly forward.",
      "Gentle pressure with the other hand."
    ],
    "area": "Neck",
    "muscles": [
      "Neck",
      "Traps"
    ]
  },
  "levator": {
    "name": "Levator Scapulae Stretch",
    "type": "hold",
    "value": 20,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Turn your head 45° toward one armpit.",
      "Look down toward that armpit.",
      "Gently pull the head down with the same-side hand."
    ],
    "area": "Neck",
    "muscles": [
      "Neck",
      "Traps"
    ]
  },
  "bhind": {
    "name": "Behind-Back Chest Opener",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Clasp your hands behind your back.",
      "Straighten the arms and lift them slightly.",
      "Open the chest and squeeze shoulder blades."
    ],
    "area": "Chest",
    "muscles": [
      "Chest",
      "Shoulders",
      "Biceps"
    ]
  },
  "wrist": {
    "name": "Wrist & Forearm Stretch",
    "type": "hold",
    "value": 20,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Arm straight in front, palm up.",
      "Pull the fingers back gently with the other hand.",
      "Then flip the palm down and pull the hand toward you."
    ],
    "area": "Forearms",
    "muscles": [
      "Forearms"
    ]
  },
  "sidereach": {
    "name": "Overhead Side Reach",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Stand with feet together, one arm overhead.",
      "Lean to the opposite side, reaching long.",
      "Feel it along the side of your body and lat."
    ],
    "area": "Lats",
    "muscles": [
      "Back",
      "Abs & core"
    ]
  },
  "thread": {
    "name": "Thread the Needle",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "On hands and knees.",
      "Slide one arm under your body along the floor.",
      "Rest that shoulder and side of the head down."
    ],
    "area": "Upper back",
    "muscles": [
      "Back",
      "Shoulders"
    ]
  },
  "sphinx": {
    "name": "Sphinx Pose",
    "type": "hold",
    "value": 45,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Lie face down, forearms on the floor, elbows under shoulders.",
      "Lift the chest gently, hips stay down.",
      "Relax the lower back and breathe."
    ],
    "area": "Lower back",
    "muscles": [
      "Lower back",
      "Abs & core"
    ]
  },
  "stwist": {
    "name": "Lying Supine Twist",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your back, arms out wide.",
      "Drop both bent knees to one side.",
      "Keep both shoulders on the floor, look the other way."
    ],
    "area": "Spine",
    "muscles": [
      "Lower back",
      "Glutes"
    ]
  },
  "couch": {
    "name": "Couch Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Kneel with one shin up against a wall or bench.",
      "Step the other foot forward into a lunge.",
      "Squeeze the glute and lift the chest tall."
    ],
    "area": "Quads & hip flexors",
    "muscles": [
      "Quads",
      "Hips"
    ]
  },
  "lyquad": {
    "name": "Side-Lying Quad Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your side.",
      "Pull the top heel toward your glute.",
      "Keep the knees together and hips pushed forward."
    ],
    "area": "Quads",
    "muscles": [
      "Quads"
    ]
  },
  "pigeon": {
    "name": "Pigeon Pose",
    "type": "hold",
    "value": 45,
    "sides": 2,
    "pace": 3,
    "cues": [
      "From hands and knees, bring one knee forward behind the wrist.",
      "Extend the other leg straight back.",
      "Lower your chest toward the floor."
    ],
    "area": "Glutes & hips",
    "muscles": [
      "Glutes",
      "Hips"
    ]
  },
  "wfold": {
    "name": "Wide-Leg Forward Fold",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Stand with feet wide apart, toes forward.",
      "Hinge at the hips and fold forward.",
      "Let the head hang, hands on the floor or shins."
    ],
    "area": "Hamstrings & groin",
    "muscles": [
      "Hamstrings",
      "Hips"
    ]
  },
  "toe": {
    "name": "Standing Toe Touch",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Feet together, knees soft.",
      "Fold forward from the hips.",
      "Let the upper body hang, don't bounce."
    ],
    "area": "Hamstrings",
    "muscles": [
      "Hamstrings",
      "Lower back"
    ]
  },
  "strap": {
    "name": "Lying Hamstring Stretch (Towel)",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Lie on your back, towel around one foot.",
      "Raise the leg straight up.",
      "Pull gently; keep the other leg flat."
    ],
    "area": "Hamstrings",
    "muscles": [
      "Hamstrings"
    ]
  },
  "dog": {
    "name": "Downward Dog",
    "type": "hold",
    "value": 30,
    "sides": 1,
    "pace": 3,
    "cues": [
      "Start in a push-up position.",
      "Push hips up and back into an upside-down V.",
      "Press heels toward the floor."
    ],
    "area": "Calves & hamstrings",
    "muscles": [
      "Calves",
      "Hamstrings",
      "Shoulders"
    ]
  },
  "stepcalf": {
    "name": "Step Calf Stretch",
    "type": "hold",
    "value": 30,
    "sides": 2,
    "pace": 3,
    "cues": [
      "Stand with the ball of one foot on a step.",
      "Let the heel drop below the step.",
      "Hold a rail for balance."
    ],
    "area": "Calves",
    "muscles": [
      "Calves"
    ]
  }
};

export const STRETCH_PLANS: Record<string, { w: string[]; c: string[] }> = {
  "mon": {
    "w": [
      "catcow",
      "birddog",
      "thor",
      "hipc",
      "glbr",
      "ankle"
    ],
    "c": [
      "neck",
      "thread",
      "bhind",
      "wrist",
      "sphinx",
      "stwist",
      "hipf",
      "fig4",
      "strap",
      "dog"
    ]
  },
  "tue": {
    "w": [
      "jj",
      "armc",
      "bandpa",
      "thor",
      "legfb",
      "bwsq"
    ],
    "c": [
      "neck",
      "door",
      "xbody",
      "ohtri",
      "thread",
      "hipf",
      "fig4",
      "ham",
      "calf"
    ]
  },
  "wed": {
    "w": [
      "jj",
      "torso",
      "legfb",
      "legss",
      "wgs",
      "bwsq"
    ],
    "c": [
      "levator",
      "thread",
      "bhind",
      "sphinx",
      "couch",
      "strap",
      "fig4",
      "fly",
      "stepcalf"
    ]
  },
  "thu": {
    "w": [
      "highk",
      "shroll",
      "scap",
      "catcow",
      "hipc",
      "lunge"
    ],
    "c": [
      "trap",
      "lat",
      "bicep",
      "door",
      "stwist",
      "pigeon",
      "toe",
      "lyquad",
      "dog"
    ]
  },
  "fri": {
    "w": [
      "highk",
      "torso",
      "ankle",
      "hipc",
      "lunge",
      "glbr"
    ],
    "c": [
      "trap",
      "xbody",
      "door",
      "twist",
      "quad",
      "ham",
      "pigeon",
      "wfold",
      "calf"
    ]
  },
  "sat": {
    "w": [
      "highk",
      "armc",
      "scap",
      "inch",
      "hipc",
      "lunge"
    ],
    "c": [
      "levator",
      "bhind",
      "ohtri",
      "wrist",
      "child",
      "twist",
      "pigeon",
      "wfold",
      "stepcalf"
    ]
  },
  "sun": {
    "w": [
      "jj",
      "shroll",
      "bandpa",
      "catcow",
      "wgs",
      "glbr"
    ],
    "c": [
      "neck",
      "sidereach",
      "bicep",
      "xbody",
      "child",
      "hipf",
      "fig4",
      "strap",
      "calf"
    ]
  }
};

export const HOLD_OPTIONS = [
  15,
  20,
  30,
  45,
  60,
  90
];
export const STRETCH_REP_OPTIONS = [
  5,
  6,
  8,
  10,
  12,
  15,
  20,
  25,
  30
];
export const TIME_OPTIONS = [
  30,
  45,
  60,
  90,
  120
];
export const ROUND_OPTIONS = [
  1,
  2,
  3
];
