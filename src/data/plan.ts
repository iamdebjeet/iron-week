// Workout plan: one entry per weekday (Mon = swim only)
import type { Day } from './types';

export const DAYS: Day[] = [
  {
    "key": "mon",
    "short": "Mon",
    "title": "Rest day",
    "rest": true,
    "exercises": []
  },
  {
    "key": "tue",
    "short": "Tue",
    "title": "Push A · Chest focus",
    "finisher": "5 min incline treadmill walk.",
    "exercises": [
      {
        "name": "Flat Barbell Bench Press",
        "sets": 4,
        "reps": "8–10",
        "rest": 120,
        "cues": [
          "Lie flat, eyes under the bar, feet planted.",
          "Squeeze shoulder blades together and down.",
          "Lower the bar to mid-chest with elbows about 45° from your body.",
          "Press up and slightly back to lockout."
        ]
      },
      {
        "name": "Incline Dumbbell Press",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "cues": [
          "Set the bench to 30–45°.",
          "Start with dumbbells at chest level, palms forward.",
          "Press up until arms are straight, dumbbells close but not touching.",
          "Lower slowly for 2–3 seconds."
        ]
      },
      {
        "name": "Seated Dumbbell Shoulder Press",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "cues": [
          "Sit upright with back against the pad.",
          "Start with dumbbells at ear height.",
          "Press overhead without arching your lower back.",
          "Lower back to ear height under control."
        ]
      },
      {
        "name": "Dumbbell Lateral Raise",
        "sets": 3,
        "reps": "12–15",
        "rest": 60,
        "cues": [
          "Stand tall with a slight bend in the elbows.",
          "Raise arms out to the sides up to shoulder height.",
          "Lead with the elbows, not the hands.",
          "Lower slowly; use light weight."
        ]
      },
      {
        "name": "Triceps Rope Pushdown",
        "sets": 3,
        "reps": "12–15",
        "rest": 60,
        "cues": [
          "Grip the rope, elbows tucked at your sides.",
          "Push down until arms are straight and spread the rope at the bottom.",
          "Keep elbows still; only forearms move.",
          "Return slowly to chest height."
        ]
      },
      {
        "name": "Overhead Cable Triceps Extension",
        "sets": 3,
        "reps": "12",
        "rest": 60,
        "cues": [
          "Face away from a cable machine, rope held behind your head.",
          "Step forward, elbows pointing up and close to your head.",
          "Straighten the arms fully overhead.",
          "Bend the elbows slowly to return."
        ]
      },
      {
        "name": "Dead Bug (optional abs)",
        "sets": 2,
        "reps": "10 each side",
        "rest": 45,
        "cues": [
          "Lie on your back, arms straight up, knees bent at 90° over hips.",
          "Lower the opposite arm and leg toward the floor slowly.",
          "Keep your lower back pressed into the floor the whole time.",
          "Return and switch sides."
        ]
      },
      {
        "name": "Hanging Leg Raise (optional abs)",
        "sets": 2,
        "reps": "10",
        "rest": 45,
        "cues": [
          "Hang from a bar with straight arms.",
          "Raise your legs (bent or straight) up to hip height or higher.",
          "Don't swing; control the way down.",
          "Bent knees is easier; straight legs is harder."
        ]
      }
    ]
  },
  {
    "key": "wed",
    "short": "Wed",
    "title": "Legs A · Quads + Core",
    "finisher": "Core: Plank 3 × 45 sec and Hanging Knee Raise 3 × 12.",
    "exercises": [
      {
        "name": "Barbell Back Squat",
        "sets": 4,
        "reps": "8–10",
        "rest": 120,
        "cues": [
          "Bar on upper back, feet shoulder width, toes slightly out.",
          "Brace your core and sit down and back.",
          "Go down until thighs are parallel, knees follow the toes.",
          "Push through the whole foot to stand up."
        ]
      },
      {
        "name": "Leg Press",
        "sets": 3,
        "reps": "12",
        "rest": 90,
        "cues": [
          "Feet shoulder width in the middle of the platform.",
          "Lower until knees are about 90°.",
          "Do not let your lower back lift off the seat.",
          "Press up without locking the knees."
        ]
      },
      {
        "name": "Walking Lunges",
        "sets": 3,
        "reps": "10 each leg",
        "rest": 90,
        "cues": [
          "Hold dumbbells at your sides, stand tall.",
          "Take a long step forward.",
          "Lower until the back knee nearly touches the floor.",
          "Push off the front foot into the next step."
        ]
      },
      {
        "name": "Leg Extension",
        "sets": 3,
        "reps": "12–15",
        "rest": 60,
        "cues": [
          "Adjust the pad to sit just above the ankles.",
          "Straighten your legs fully.",
          "Squeeze the thighs for one second at the top.",
          "Lower slowly."
        ]
      },
      {
        "name": "Standing Calf Raise",
        "sets": 4,
        "reps": "15",
        "rest": 60,
        "cues": [
          "Balls of the feet on the edge, heels hanging.",
          "Rise as high as you can onto your toes.",
          "Pause one second at the top.",
          "Lower until you feel a stretch in the calves."
        ]
      }
    ]
  },
  {
    "key": "thu",
    "short": "Thu",
    "title": "Pull A · Back width",
    "finisher": "Hammer Curl 2 × 12, then stretch back and biceps.",
    "exercises": [
      {
        "name": "Lat Pulldown (wide grip)",
        "sets": 4,
        "reps": "10–12",
        "rest": 90,
        "cues": [
          "Grip the bar wider than shoulders, thighs under the pad.",
          "Lean back slightly and pull the bar to upper chest.",
          "Drive elbows down toward your hips.",
          "Let the bar rise slowly until arms are straight."
        ]
      },
      {
        "name": "Seated Cable Row",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "cues": [
          "Sit tall, knees slightly bent, chest up.",
          "Pull the handle to your belly.",
          "Squeeze shoulder blades together at the end.",
          "Reach forward slowly without rounding the back."
        ]
      },
      {
        "name": "One-Arm Dumbbell Row",
        "sets": 3,
        "reps": "10 each arm",
        "rest": 60,
        "cues": [
          "One knee and hand on the bench, back flat.",
          "Pull the dumbbell toward your hip.",
          "Keep the elbow close to your body.",
          "Lower until the arm is fully straight."
        ]
      },
      {
        "name": "Face Pull",
        "sets": 3,
        "reps": "15",
        "rest": 60,
        "cues": [
          "Set the rope at face height.",
          "Pull the rope toward your forehead, hands apart.",
          "Elbows stay high, finish with hands beside ears.",
          "Return slowly."
        ]
      },
      {
        "name": "Barbell Bicep Curl",
        "sets": 3,
        "reps": "10–12",
        "rest": 60,
        "cues": [
          "Stand tall, grip shoulder width, palms up.",
          "Curl the bar up keeping elbows at your sides.",
          "No swinging the body.",
          "Lower slowly to full arm extension."
        ]
      },
      {
        "name": "Single-Leg Calf Raise",
        "sets": 3,
        "reps": "15 each leg",
        "rest": 45,
        "cues": [
          "Stand on one foot on the edge of a step, hold a rail for balance.",
          "Lower the heel below the step for a full stretch.",
          "Rise up as high as you can and pause for 1 second.",
          "Do all reps on one leg, then switch. Hold a dumbbell to make it harder."
        ]
      }
    ]
  },
  {
    "key": "fri",
    "short": "Fri",
    "title": "Legs B · Hamstrings, Glutes + Core",
    "finisher": "Core: Cable Crunch 3 × 15, Russian Twist 3 × 20, Side Plank 2 × 30 sec each side.",
    "exercises": [
      {
        "name": "Romanian Deadlift",
        "sets": 4,
        "reps": "8–10",
        "rest": 120,
        "cues": [
          "Stand holding the bar, knees slightly bent.",
          "Push hips back, sliding the bar down your thighs.",
          "Keep the back flat; stop when hamstrings are stretched.",
          "Drive hips forward to stand."
        ]
      },
      {
        "name": "Hip Thrust (Barbell or Machine)",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "cues": [
          "Upper back on a bench, bar over the hips (use a pad).",
          "Feet flat, knees bent about 90°.",
          "Drive hips up until the body is straight from knees to shoulders.",
          "Squeeze glutes at the top, then lower."
        ]
      },
      {
        "name": "Lying / Seated Leg Curl",
        "sets": 3,
        "reps": "12",
        "rest": 60,
        "cues": [
          "Adjust the pad to sit just above the heels.",
          "Curl the heels toward your glutes.",
          "Pause and squeeze.",
          "Return slowly."
        ]
      },
      {
        "name": "Goblet Squat",
        "sets": 3,
        "reps": "12",
        "rest": 60,
        "cues": [
          "Hold one dumbbell at your chest.",
          "Feet shoulder width, toes slightly out.",
          "Squat down keeping chest up and elbows inside knees.",
          "Stand up through the whole foot."
        ]
      },
      {
        "name": "Seated Calf Raise",
        "sets": 4,
        "reps": "15",
        "rest": 60,
        "cues": [
          "Pad on the lower thighs, balls of feet on the platform.",
          "Raise heels as high as possible.",
          "Pause at the top.",
          "Lower for a deep stretch."
        ]
      }
    ]
  },
  {
    "key": "sat",
    "short": "Sat",
    "title": "Push B · Shoulder focus",
    "finisher": "5 min cycling.",
    "exercises": [
      {
        "name": "Standing Barbell Overhead Press",
        "sets": 4,
        "reps": "8–10",
        "rest": 120,
        "cues": [
          "Bar at upper chest, grip just outside shoulders.",
          "Squeeze glutes and core so your back doesn't arch.",
          "Press straight up, moving your head back then through.",
          "Lower to upper chest under control."
        ]
      },
      {
        "name": "Incline Barbell Bench Press",
        "sets": 3,
        "reps": "8–10",
        "rest": 90,
        "cues": [
          "Bench at 30°, shoulder blades pulled back.",
          "Lower the bar to upper chest.",
          "Elbows slightly tucked.",
          "Press up to lockout."
        ]
      },
      {
        "name": "Cable Fly / Pec Deck",
        "sets": 3,
        "reps": "12–15",
        "rest": 60,
        "cues": [
          "Slight bend in the elbows throughout.",
          "Bring hands together in a hugging motion.",
          "Squeeze the chest at the middle.",
          "Open back up slowly until you feel a stretch."
        ]
      },
      {
        "name": "Cable Lateral Raise",
        "sets": 3,
        "reps": "12–15 each side",
        "rest": 60,
        "cues": [
          "Stand side-on to a low cable, handle in the far hand.",
          "Raise the arm out to shoulder height.",
          "Keep the body still.",
          "Lower slowly."
        ]
      },
      {
        "name": "Overhead Dumbbell Triceps Extension",
        "sets": 3,
        "reps": "10–12",
        "rest": 60,
        "cues": [
          "Hold one dumbbell with both hands overhead.",
          "Lower it behind your head by bending the elbows.",
          "Keep elbows pointing up and close to your head.",
          "Straighten the arms back up."
        ]
      },
      {
        "name": "Diamond Push-ups",
        "sets": 2,
        "reps": "max",
        "rest": 60,
        "cues": [
          "Hands close together under your chest, thumbs and index fingers forming a diamond.",
          "Body straight from head to heels.",
          "Lower your chest to your hands, elbows close to your sides.",
          "Push back up. Do them on your knees if needed."
        ]
      },
      {
        "name": "Dead Bug (optional abs)",
        "sets": 2,
        "reps": "10 each side",
        "rest": 45,
        "cues": [
          "Lie on your back, arms straight up, knees bent at 90° over hips.",
          "Lower the opposite arm and leg toward the floor slowly.",
          "Keep your lower back pressed into the floor the whole time.",
          "Return and switch sides."
        ]
      },
      {
        "name": "Hanging Leg Raise (optional abs)",
        "sets": 2,
        "reps": "10",
        "rest": 45,
        "cues": [
          "Hang from a bar with straight arms.",
          "Raise your legs (bent or straight) up to hip height or higher.",
          "Don't swing; control the way down.",
          "Bent knees is easier; straight legs is harder."
        ]
      }
    ]
  },
  {
    "key": "sun",
    "short": "Sun",
    "title": "Pull B · Back thickness",
    "finisher": "Dumbbell Shrugs 3 × 15.",
    "exercises": [
      {
        "name": "Deadlift (or Rack Pull)",
        "sets": 4,
        "reps": "6–8",
        "rest": 120,
        "cues": [
          "Bar over mid-foot, shins close to the bar.",
          "Hips back, back flat, chest up, grip just outside legs.",
          "Push the floor away and stand up tall.",
          "Lower by pushing hips back first, bar close to the legs."
        ]
      },
      {
        "name": "Pull-ups / Assisted Pull-ups",
        "sets": 3,
        "reps": "max (6–10)",
        "rest": 90,
        "cues": [
          "Grip slightly wider than shoulders.",
          "Pull until your chin is over the bar.",
          "Drive elbows down to your sides.",
          "Lower to straight arms each rep. Use the assisted machine if needed."
        ]
      },
      {
        "name": "Barbell Bent-Over Row",
        "sets": 3,
        "reps": "8–10",
        "rest": 90,
        "cues": [
          "Hinge at the hips to about 45°, back flat.",
          "Pull the bar to your lower chest or belly.",
          "Squeeze shoulder blades together.",
          "Lower under control."
        ]
      },
      {
        "name": "Reverse Pec Deck",
        "sets": 3,
        "reps": "15",
        "rest": 60,
        "cues": [
          "Face the machine, chest against the pad.",
          "Arms straight in front, slight elbow bend.",
          "Open arms out to the sides.",
          "Squeeze rear shoulders, return slowly."
        ]
      },
      {
        "name": "Incline Dumbbell Curl",
        "sets": 3,
        "reps": "10–12",
        "rest": 60,
        "cues": [
          "Lie back on a bench set to 45°.",
          "Arms hang straight down, palms forward.",
          "Curl up without moving the elbows forward.",
          "Lower slowly for a full stretch."
        ]
      },
      {
        "name": "Hammer Curl",
        "sets": 2,
        "reps": "12",
        "rest": 60,
        "cues": [
          "Stand holding dumbbells at your sides, palms facing in.",
          "Curl up keeping palms facing each other.",
          "Elbows stay at your sides.",
          "Lower slowly."
        ]
      }
    ]
  }
];

/** Finisher moves written as text on the finisher card, counted in the muscle map */
export const FINISHER_MOVES: Record<string, [string, number][]> = {
  "thu": [
    [
      "Hammer Curl",
      2
    ]
  ],
  "wed": [
    [
      "Plank",
      3
    ],
    [
      "Hanging Knee Raise",
      3
    ]
  ],
  "sun": [
    [
      "Dumbbell Shrugs",
      3
    ]
  ],
  "fri": [
    [
      "Cable Crunch",
      3
    ],
    [
      "Russian Twist",
      3
    ],
    [
      "Side Plank",
      2
    ]
  ]
};

export const SET_OPTIONS = [
  1,
  2,
  3,
  4,
  5,
  6
];
export const REP_OPTIONS = [
  8,
  10,
  12,
  15,
  18,
  21,
  24,
  27,
  30
];
