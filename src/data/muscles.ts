// Which muscles each exercise works, plus swap alternatives
import type { Muscle, MuscleUse } from './types';

export const MUSCLES: Muscle[] = [
  "Neck",
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Biceps",
  "Forearms",
  "Traps",
  "Abs & core",
  "Lower back",
  "Hips",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves"
];
export const HELPER_ONLY: Muscle[] = [
  "Forearms",
  "Traps",
  "Lower back"
];
export const STRETCH_ONLY: Muscle[] = [
  "Neck",
  "Hips"
];

export const EXERCISE_MUSCLES: Record<string, MuscleUse> = {
  "Flat Barbell Bench Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ]
  },
  "Incline Dumbbell Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ]
  },
  "Seated Dumbbell Shoulder Press": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Triceps"
    ]
  },
  "Dumbbell Lateral Raise": {
    "main": [
      "Shoulders"
    ],
    "helps": []
  },
  "Triceps Rope Pushdown": {
    "main": [
      "Triceps"
    ],
    "helps": []
  },
  "Overhead Cable Triceps Extension": {
    "main": [
      "Triceps"
    ],
    "helps": []
  },
  "Dead Bug (optional abs)": {
    "main": [
      "Abs & core"
    ],
    "helps": []
  },
  "Hanging Leg Raise (optional abs)": {
    "main": [
      "Abs & core"
    ],
    "helps": [
      "Forearms"
    ]
  },
  "Lat Pulldown (wide grip)": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps"
    ]
  },
  "Seated Cable Row": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps"
    ]
  },
  "One-Arm Dumbbell Row": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps"
    ]
  },
  "Face Pull": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Back",
      "Traps"
    ]
  },
  "Barbell Bicep Curl": {
    "main": [
      "Biceps"
    ],
    "helps": [
      "Forearms"
    ]
  },
  "Barbell Back Squat": {
    "main": [
      "Quads"
    ],
    "helps": [
      "Glutes",
      "Lower back",
      "Abs & core"
    ]
  },
  "Leg Press": {
    "main": [
      "Quads"
    ],
    "helps": [
      "Glutes"
    ]
  },
  "Walking Lunges": {
    "main": [
      "Quads",
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ]
  },
  "Leg Extension": {
    "main": [
      "Quads"
    ],
    "helps": []
  },
  "Standing Calf Raise": {
    "main": [
      "Calves"
    ],
    "helps": []
  },
  "Standing Barbell Overhead Press": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Triceps",
      "Abs & core"
    ]
  },
  "Incline Barbell Bench Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ]
  },
  "Cable Fly / Pec Deck": {
    "main": [
      "Chest"
    ],
    "helps": []
  },
  "Cable Lateral Raise": {
    "main": [
      "Shoulders"
    ],
    "helps": []
  },
  "Overhead Dumbbell Triceps Extension": {
    "main": [
      "Triceps"
    ],
    "helps": []
  },
  "Diamond Push-ups": {
    "main": [
      "Triceps"
    ],
    "helps": [
      "Chest",
      "Abs & core"
    ]
  },
  "Deadlift (or Rack Pull)": {
    "main": [
      "Hamstrings",
      "Glutes",
      "Lower back"
    ],
    "helps": [
      "Back",
      "Traps",
      "Forearms"
    ]
  },
  "Pull-ups / Assisted Pull-ups": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps",
      "Forearms"
    ]
  },
  "Barbell Bent-Over Row": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps",
      "Lower back"
    ]
  },
  "Reverse Pec Deck": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Back"
    ]
  },
  "Incline Dumbbell Curl": {
    "main": [
      "Biceps"
    ],
    "helps": []
  },
  "Hammer Curl": {
    "main": [
      "Biceps",
      "Forearms"
    ],
    "helps": []
  },
  "Romanian Deadlift": {
    "main": [
      "Hamstrings"
    ],
    "helps": [
      "Glutes",
      "Lower back"
    ]
  },
  "Hip Thrust (Barbell or Machine)": {
    "main": [
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ]
  },
  "Lying / Seated Leg Curl": {
    "main": [
      "Hamstrings"
    ],
    "helps": []
  },
  "Goblet Squat": {
    "main": [
      "Quads"
    ],
    "helps": [
      "Glutes",
      "Abs & core"
    ]
  },
  "Seated Calf Raise": {
    "main": [
      "Calves"
    ],
    "helps": []
  },
  "Single-Leg Calf Raise": {
    "main": [
      "Calves"
    ],
    "helps": []
  },
  "Dumbbell Shrugs": {
    "main": [
      "Traps"
    ],
    "helps": [
      "Forearms"
    ]
  },
  "Plank": {
    "main": [
      "Abs & core"
    ],
    "helps": []
  },
  "Hanging Knee Raise": {
    "main": [
      "Abs & core"
    ],
    "helps": [
      "Forearms"
    ]
  },
  "Cable Crunch": {
    "main": [
      "Abs & core"
    ],
    "helps": []
  },
  "Russian Twist": {
    "main": [
      "Abs & core"
    ],
    "helps": []
  },
  "Side Plank": {
    "main": [
      "Abs & core"
    ],
    "helps": []
  }
};

/** Two alternatives for each exercise, for when a machine or bench is busy */
export const ALTERNATIVES: Record<string, string[]> = {
  "Flat Barbell Bench Press": [
    "Dumbbell Bench Press",
    "Machine Chest Press"
  ],
  "Incline Dumbbell Press": [
    "Incline Machine Press",
    "Incline Barbell Bench Press"
  ],
  "Seated Dumbbell Shoulder Press": [
    "Machine Shoulder Press",
    "Arnold Press"
  ],
  "Dumbbell Lateral Raise": [
    "Cable Lateral Raise",
    "Machine Lateral Raise"
  ],
  "Triceps Rope Pushdown": [
    "Straight-Bar Pushdown",
    "Bench Dips"
  ],
  "Overhead Cable Triceps Extension": [
    "Overhead Dumbbell Triceps Extension",
    "Skull Crushers (EZ Bar)"
  ],
  "Dead Bug (optional abs)": [
    "Plank",
    "Lying Leg Raise"
  ],
  "Hanging Leg Raise (optional abs)": [
    "Lying Leg Raise",
    "Cable Crunch"
  ],
  "Lat Pulldown (wide grip)": [
    "Pull-ups / Assisted Pull-ups",
    "Straight-Arm Cable Pulldown"
  ],
  "Seated Cable Row": [
    "Chest-Supported Row",
    "Barbell Bent-Over Row"
  ],
  "One-Arm Dumbbell Row": [
    "Seated Cable Row",
    "Chest-Supported Dumbbell Row"
  ],
  "Face Pull": [
    "Reverse Pec Deck",
    "Band Pull-Apart"
  ],
  "Barbell Bicep Curl": [
    "EZ-Bar Curl",
    "Dumbbell Curl"
  ],
  "Single-Leg Calf Raise": [
    "Standing Calf Raise",
    "Seated Calf Raise"
  ],
  "Barbell Back Squat": [
    "Smith Machine Squat",
    "Goblet Squat"
  ],
  "Leg Press": [
    "Hack Squat",
    "Goblet Squat"
  ],
  "Walking Lunges": [
    "Bulgarian Split Squat",
    "Step-Ups"
  ],
  "Leg Extension": [
    "Goblet Squat",
    "Step-Ups"
  ],
  "Standing Calf Raise": [
    "Leg Press Calf Raise",
    "Single-Leg Calf Raise"
  ],
  "Standing Barbell Overhead Press": [
    "Seated Dumbbell Shoulder Press",
    "Machine Shoulder Press"
  ],
  "Incline Barbell Bench Press": [
    "Incline Dumbbell Press",
    "Incline Machine Press"
  ],
  "Cable Fly / Pec Deck": [
    "Dumbbell Fly",
    "Push-ups"
  ],
  "Cable Lateral Raise": [
    "Dumbbell Lateral Raise",
    "Machine Lateral Raise"
  ],
  "Overhead Dumbbell Triceps Extension": [
    "Overhead Cable Triceps Extension",
    "Skull Crushers (EZ Bar)"
  ],
  "Diamond Push-ups": [
    "Bench Dips",
    "Close-Grip Bench Press"
  ],
  "Deadlift (or Rack Pull)": [
    "Trap Bar Deadlift",
    "Romanian Deadlift"
  ],
  "Pull-ups / Assisted Pull-ups": [
    "Lat Pulldown (wide grip)",
    "Straight-Arm Cable Pulldown"
  ],
  "Barbell Bent-Over Row": [
    "Chest-Supported Row",
    "One-Arm Dumbbell Row"
  ],
  "Reverse Pec Deck": [
    "Face Pull",
    "Bent-Over Dumbbell Reverse Fly"
  ],
  "Incline Dumbbell Curl": [
    "Dumbbell Curl",
    "Cable Curl"
  ],
  "Hammer Curl": [
    "Rope Cable Hammer Curl",
    "Dumbbell Curl"
  ],
  "Romanian Deadlift": [
    "Dumbbell Romanian Deadlift",
    "Good Morning (light barbell)"
  ],
  "Hip Thrust (Barbell or Machine)": [
    "Weighted Glute Bridge",
    "Cable Pull-Through"
  ],
  "Lying / Seated Leg Curl": [
    "Swiss Ball Leg Curl",
    "Dumbbell Romanian Deadlift"
  ],
  "Goblet Squat": [
    "Leg Press",
    "Bulgarian Split Squat"
  ],
  "Seated Calf Raise": [
    "Leg Press Calf Raise",
    "Standing Calf Raise"
  ]
};

/** Exercises that only appear as alternatives */
export const EXTRA_EXERCISES: Record<string, MuscleUse & { cues: string[] }> = {
  "Dumbbell Bench Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ],
    "cues": [
      "Lie flat with dumbbells at chest level, palms forward.",
      "Press up until arms are straight.",
      "Lower slowly until elbows are just below the bench."
    ]
  },
  "Machine Chest Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ],
    "cues": [
      "Set the seat so handles are at mid-chest.",
      "Press forward until arms are straight.",
      "Return slowly without letting the weights touch."
    ]
  },
  "Incline Machine Press": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps"
    ],
    "cues": [
      "Set the seat so handles are at upper chest.",
      "Press up and forward to lockout.",
      "Return slowly, chest up."
    ]
  },
  "Machine Shoulder Press": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Triceps"
    ],
    "cues": [
      "Set the seat so handles are at shoulder height.",
      "Press straight up without arching the back.",
      "Lower to shoulder height under control."
    ]
  },
  "Arnold Press": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Triceps"
    ],
    "cues": [
      "Start with dumbbells in front of your face, palms facing you.",
      "Rotate palms forward as you press overhead.",
      "Reverse the turn on the way down."
    ]
  },
  "Machine Lateral Raise": {
    "main": [
      "Shoulders"
    ],
    "helps": [],
    "cues": [
      "Pads on the outside of your arms, elbows slightly bent.",
      "Raise arms out to shoulder height.",
      "Lower slowly."
    ]
  },
  "Straight-Bar Pushdown": {
    "main": [
      "Triceps"
    ],
    "helps": [],
    "cues": [
      "Grip a straight bar, elbows tucked at your sides.",
      "Push down until arms are straight.",
      "Return slowly; elbows stay still."
    ]
  },
  "Bench Dips": {
    "main": [
      "Triceps"
    ],
    "helps": [
      "Chest",
      "Shoulders"
    ],
    "cues": [
      "Hands on the edge of a bench behind you, legs forward.",
      "Bend elbows to lower your body, elbows pointing back.",
      "Push back up to straight arms."
    ]
  },
  "Skull Crushers (EZ Bar)": {
    "main": [
      "Triceps"
    ],
    "helps": [],
    "cues": [
      "Lie on a bench holding an EZ bar above your chest.",
      "Bend only the elbows to lower the bar toward your forehead.",
      "Straighten the arms back up."
    ]
  },
  "Straight-Arm Cable Pulldown": {
    "main": [
      "Back"
    ],
    "helps": [
      "Triceps"
    ],
    "cues": [
      "Face a high cable, arms straight, slight lean forward.",
      "Pull the bar down to your thighs keeping arms straight.",
      "Return slowly to overhead."
    ]
  },
  "Chest-Supported Row": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps"
    ],
    "cues": [
      "Chest on the pad, grab the handles.",
      "Pull elbows back and squeeze shoulder blades.",
      "Return slowly to straight arms."
    ]
  },
  "Chest-Supported Dumbbell Row": {
    "main": [
      "Back"
    ],
    "helps": [
      "Biceps"
    ],
    "cues": [
      "Lie face down on an incline bench with dumbbells.",
      "Row the dumbbells up to your sides.",
      "Lower slowly."
    ]
  },
  "Band Pull-Apart": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Back",
      "Traps"
    ],
    "cues": [
      "Hold a band at chest height, arms straight.",
      "Pull it apart until it touches your chest.",
      "Return slowly."
    ]
  },
  "EZ-Bar Curl": {
    "main": [
      "Biceps"
    ],
    "helps": [
      "Forearms"
    ],
    "cues": [
      "Hold the EZ bar on the angled grips.",
      "Curl up with elbows at your sides.",
      "Lower slowly."
    ]
  },
  "Dumbbell Curl": {
    "main": [
      "Biceps"
    ],
    "helps": [
      "Forearms"
    ],
    "cues": [
      "Stand with dumbbells, palms forward.",
      "Curl both up without swinging.",
      "Lower slowly to straight arms."
    ]
  },
  "Cable Curl": {
    "main": [
      "Biceps"
    ],
    "helps": [],
    "cues": [
      "Face a low cable with a straight bar.",
      "Curl up with elbows fixed at your sides.",
      "Lower slowly."
    ]
  },
  "Rope Cable Hammer Curl": {
    "main": [
      "Biceps",
      "Forearms"
    ],
    "helps": [],
    "cues": [
      "Low cable with a rope, palms facing each other.",
      "Curl the rope up to your chest.",
      "Lower slowly."
    ]
  },
  "Smith Machine Squat": {
    "main": [
      "Quads"
    ],
    "helps": [
      "Glutes"
    ],
    "cues": [
      "Bar on upper back, feet slightly in front of you.",
      "Squat down to parallel.",
      "Push up through the whole foot."
    ]
  },
  "Hack Squat": {
    "main": [
      "Quads"
    ],
    "helps": [
      "Glutes"
    ],
    "cues": [
      "Back against the pad, shoulders under the pads.",
      "Lower until knees are about 90°.",
      "Press up without locking the knees."
    ]
  },
  "Bulgarian Split Squat": {
    "main": [
      "Quads",
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ],
    "cues": [
      "Back foot on a bench, front foot well forward.",
      "Lower until the back knee nearly touches the floor.",
      "Push up through the front foot. Do all reps, then switch."
    ]
  },
  "Step-Ups": {
    "main": [
      "Quads",
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ],
    "cues": [
      "Hold dumbbells, face a box or bench.",
      "Step up with one foot and stand tall.",
      "Step down slowly and repeat."
    ]
  },
  "Leg Press Calf Raise": {
    "main": [
      "Calves"
    ],
    "helps": [],
    "cues": [
      "Sit in the leg press, balls of the feet on the bottom edge.",
      "Push the platform with your toes as far as you can.",
      "Let the heels come back for a full stretch."
    ]
  },
  "Dumbbell Fly": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders"
    ],
    "cues": [
      "Lie flat, dumbbells above chest, elbows slightly bent.",
      "Open the arms wide until you feel a chest stretch.",
      "Bring them back together in a hugging motion."
    ]
  },
  "Push-ups": {
    "main": [
      "Chest"
    ],
    "helps": [
      "Shoulders",
      "Triceps",
      "Abs & core"
    ],
    "cues": [
      "Hands just wider than shoulders, body straight.",
      "Lower your chest to the floor.",
      "Push back up."
    ]
  },
  "Close-Grip Bench Press": {
    "main": [
      "Triceps"
    ],
    "helps": [
      "Chest",
      "Shoulders"
    ],
    "cues": [
      "Grip the bar shoulder width.",
      "Lower to lower chest with elbows close to your body.",
      "Press back up."
    ]
  },
  "Lying Leg Raise": {
    "main": [
      "Abs & core"
    ],
    "helps": [],
    "cues": [
      "Lie on your back, hands under your hips.",
      "Raise straight legs up to 90°.",
      "Lower slowly without touching the floor."
    ]
  },
  "Trap Bar Deadlift": {
    "main": [
      "Quads",
      "Glutes",
      "Hamstrings"
    ],
    "helps": [
      "Back",
      "Lower back",
      "Traps",
      "Forearms"
    ],
    "cues": [
      "Stand inside the hex bar, grab the handles.",
      "Hips back, chest up, back flat.",
      "Stand up tall, then lower with control."
    ]
  },
  "Bent-Over Dumbbell Reverse Fly": {
    "main": [
      "Shoulders"
    ],
    "helps": [
      "Back"
    ],
    "cues": [
      "Hinge forward, dumbbells hanging below your chest.",
      "Raise arms out to the sides with a slight elbow bend.",
      "Lower slowly."
    ]
  },
  "Dumbbell Romanian Deadlift": {
    "main": [
      "Hamstrings"
    ],
    "helps": [
      "Glutes",
      "Lower back"
    ],
    "cues": [
      "Hold dumbbells in front of your thighs.",
      "Push hips back, sliding them down your legs.",
      "Stand up by driving hips forward."
    ]
  },
  "Good Morning (light barbell)": {
    "main": [
      "Hamstrings",
      "Lower back"
    ],
    "helps": [
      "Glutes"
    ],
    "cues": [
      "Light bar on upper back, knees soft.",
      "Hinge forward at the hips, back flat.",
      "Stand back up. Keep the weight light."
    ]
  },
  "Weighted Glute Bridge": {
    "main": [
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ],
    "cues": [
      "Lie on your back, weight on your hips, feet flat.",
      "Lift hips until straight from knees to shoulders.",
      "Squeeze glutes, lower slowly."
    ]
  },
  "Cable Pull-Through": {
    "main": [
      "Glutes"
    ],
    "helps": [
      "Hamstrings"
    ],
    "cues": [
      "Face away from a low cable, rope between your legs.",
      "Hinge at the hips, then drive hips forward to stand.",
      "Squeeze glutes at the top."
    ]
  },
  "Swiss Ball Leg Curl": {
    "main": [
      "Hamstrings"
    ],
    "helps": [
      "Glutes",
      "Abs & core"
    ],
    "cues": [
      "Lie on your back, heels on a ball, hips lifted.",
      "Curl the ball toward you with your heels.",
      "Roll it back out slowly, hips stay up."
    ]
  },
  "Plank": {
    "main": [
      "Abs & core"
    ],
    "helps": [],
    "cues": [
      "Forearms on the floor, body straight.",
      "Squeeze glutes and abs.",
      "Hold for 30–45 seconds per set instead of reps."
    ]
  },
  "Cable Crunch": {
    "main": [
      "Abs & core"
    ],
    "helps": [],
    "cues": [
      "Kneel facing a high cable, rope by your head.",
      "Crunch down, bringing elbows toward knees.",
      "Return slowly."
    ]
  }
};
