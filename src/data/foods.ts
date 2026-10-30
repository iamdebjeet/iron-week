// Common Indian foods, per 100 g (or 100 ml) as eaten, with typical portion sizes.
// Values are APPROXIMATE: based on IFCT 2017 (Indian Food Composition Tables, NIN) and USDA FoodData Central,
// adjusted for usual home cooking (a little oil and salt in dals and sabzis). Real dishes vary a lot,
// so treat them as a guide, not a lab result.

export type Unit = "piece" | "katori" | "cup" | "glass" | "plate" | "slice" | "tbsp" | "tsp" | "scoop" | "handful" | "g100" | "serving";

export const UNIT_LABEL: Record<Unit, string> = {
  piece: "piece", katori: "katori", cup: "cup", glass: "glass", plate: "plate", slice: "slice",
  tbsp: "tbsp", tsp: "tsp", scoop: "scoop", handful: "handful", g100: "100 g", serving: "serving",
};

/** Nutrients per 100 g. Sodium, iron and calcium in mg. */
export interface Nutrients { kcal: number; protein: number; carbs: number; fat: number; fibre: number; sodium: number; iron?: number; calcium?: number }

export interface Food {
  id: string;
  name: string;
  /** Hindi / other names people type */
  aliases: string[];
  per100: Nutrients;
  /** Grams in one of each unit; the first is the default */
  units: Partial<Record<Unit, number>>;
  /** "custom" (typed in) or "scan" (barcode) for foods the user added */
  source?: "custom" | "scan";
  barcode?: string;
}

const n = (kcal: number, protein: number, carbs: number, fat: number, fibre: number, sodium: number, iron?: number, calcium?: number): Nutrients =>
  ({ kcal, protein, carbs, fat, fibre, sodium, iron, calcium });

export const FOODS: Food[] = [
  // Breads
  { id: "roti", name: "Roti (wheat, medium)", aliases: ["chapati", "chapathi", "phulka", "fulka", "rotli"], per100: n(264, 9, 52, 3.7, 7, 200, 2.5, 30), units: { piece: 40 } },
  { id: "paratha", name: "Paratha (plain)", aliases: ["parantha", "parotta"], per100: n(326, 7, 45, 13, 5, 400, 2.2, 30), units: { piece: 80 } },
  { id: "aloo-paratha", name: "Aloo paratha", aliases: ["alu paratha", "potato paratha"], per100: n(250, 5.5, 35, 10, 4, 350, 1.5, 25), units: { piece: 120 } },
  { id: "bread-white", name: "Bread (white)", aliases: ["pav", "toast"], per100: n(265, 9, 49, 3.2, 2.7, 490, 3.6, 150), units: { slice: 25 } },
  { id: "bread-brown", name: "Bread (brown / whole wheat)", aliases: ["atta bread", "wheat bread"], per100: n(250, 10, 43, 3.5, 6, 450, 2.5, 120), units: { slice: 28 } },
  // Rice
  { id: "rice", name: "Rice (white, cooked)", aliases: ["chawal", "bhaat", "plain rice", "steamed rice"], per100: n(130, 2.7, 28, 0.3, 0.4, 1, 0.2, 10), units: { katori: 150, plate: 250, cup: 160 } },
  { id: "rice-brown", name: "Brown rice (cooked)", aliases: ["brown chawal"], per100: n(112, 2.3, 24, 0.8, 1.8, 5, 0.4, 10), units: { katori: 150, plate: 250 } },
  { id: "jeera-rice", name: "Jeera rice", aliases: ["cumin rice"], per100: n(150, 2.8, 27, 3.5, 0.6, 250, 0.4, 12), units: { katori: 150, plate: 250 } },
  { id: "veg-biryani", name: "Veg biryani / pulao", aliases: ["pulav", "pulao", "veg pulao"], per100: n(160, 3.5, 25, 5, 1.5, 350, 0.8, 20), units: { plate: 250, katori: 150 } },
  { id: "chicken-biryani", name: "Chicken biryani", aliases: ["biryani"], per100: n(180, 9, 20, 7, 1, 400, 1, 20), units: { plate: 300, katori: 150 } },
  { id: "khichdi", name: "Khichdi", aliases: ["khichri", "khichuri"], per100: n(120, 4, 18, 3.5, 2, 250, 1, 20), units: { katori: 200, plate: 300 } },
  // Dals and pulses
  { id: "dal-toor", name: "Dal (toor, cooked)", aliases: ["dal", "daal", "arhar dal", "tuvar dal", "toor dal", "dal tadka"], per100: n(115, 6.5, 16, 3, 3.5, 250, 1.5, 30), units: { katori: 150 } },
  { id: "dal-moong", name: "Moong dal (cooked)", aliases: ["mung dal", "moong daal", "yellow dal"], per100: n(105, 7, 15, 2, 3.5, 230, 1.4, 25), units: { katori: 150 } },
  { id: "dal-masoor", name: "Masoor dal (cooked)", aliases: ["masur dal", "red lentil"], per100: n(110, 7.5, 16, 2.2, 4, 230, 2, 20), units: { katori: 150 } },
  { id: "dal-makhani", name: "Dal makhani", aliases: ["maa ki dal", "kali dal"], per100: n(160, 6, 15, 9, 4, 350, 1.8, 50), units: { katori: 150 } },
  { id: "rajma", name: "Rajma (curry)", aliases: ["rajmah", "kidney beans"], per100: n(120, 6, 17, 3.5, 5, 300, 1.8, 35), units: { katori: 150 } },
  { id: "chole", name: "Chole (curry)", aliases: ["chhole", "chana masala", "chickpea curry"], per100: n(150, 7, 20, 5, 6, 320, 2.2, 45), units: { katori: 150 } },
  { id: "chana-boiled", name: "Kala chana (boiled)", aliases: ["boiled chana", "black chana", "chickpeas"], per100: n(164, 8.9, 27, 2.6, 7.6, 7, 2.9, 49), units: { katori: 100, handful: 40 } },
  { id: "sprouts", name: "Moong sprouts", aliases: ["sprouts", "ankurit moong", "sprouted moong"], per100: n(30, 3, 6, 0.2, 1.8, 6, 0.9, 13), units: { katori: 100 } },
  { id: "sambar", name: "Sambar", aliases: ["sambhar"], per100: n(70, 3, 9, 2.5, 2.5, 300, 1, 30), units: { katori: 150 } },
  { id: "rasam", name: "Rasam", aliases: ["saaru"], per100: n(30, 1, 4, 1.2, 0.8, 350, 0.5, 15), units: { katori: 150 } },
  { id: "soya", name: "Soya chunks (dry)", aliases: ["soyabean chunks", "nutrela", "meal maker", "soya"], per100: n(345, 52, 33, 0.5, 13, 20, 10, 350), units: { handful: 25, g100: 100 } },
  // Paneer, eggs, meat, fish
  { id: "paneer", name: "Paneer (raw)", aliases: ["cottage cheese", "panir"], per100: n(265, 18, 3.5, 20, 0, 20, 0.2, 480), units: { g100: 100, piece: 25 } },
  { id: "paneer-bhurji", name: "Paneer bhurji", aliases: ["panir bhurji"], per100: n(230, 13, 6, 17, 1, 350, 0.5, 350), units: { katori: 120 } },
  { id: "paneer-tikka", name: "Paneer tikka", aliases: ["panir tikka"], per100: n(220, 15, 6, 15, 1, 400, 0.5, 380), units: { piece: 30, plate: 150 } },
  { id: "palak-paneer", name: "Palak paneer", aliases: ["saag paneer"], per100: n(150, 7, 6, 11, 2, 350, 1.8, 220), units: { katori: 150 } },
  { id: "egg-boiled", name: "Egg (boiled)", aliases: ["anda", "boiled egg", "egg"], per100: n(155, 12.6, 1.1, 10.6, 0, 124, 1.2, 50), units: { piece: 50 } },
  { id: "egg-white", name: "Egg white (boiled)", aliases: ["egg whites"], per100: n(52, 11, 0.7, 0.2, 0, 166, 0.1, 7), units: { piece: 33 } },
  { id: "omelette", name: "Omelette (2 eggs)", aliases: ["omlet", "omelet", "anda bhurji", "egg bhurji"], per100: n(180, 11, 2, 14, 0.3, 300, 1.3, 50), units: { piece: 120 } },
  { id: "chicken-curry", name: "Chicken curry", aliases: ["murgh curry", "chicken masala", "chicken gravy"], per100: n(150, 14, 4, 9, 1, 400, 1, 20), units: { katori: 150 } },
  { id: "chicken-breast", name: "Chicken breast (grilled)", aliases: ["grilled chicken", "boiled chicken", "chicken"], per100: n(165, 31, 0, 3.6, 0, 74, 1, 15), units: { g100: 100, piece: 120 } },
  { id: "tandoori-chicken", name: "Tandoori chicken", aliases: ["chicken tikka", "tandoori"], per100: n(160, 25, 3, 5.5, 0.5, 500, 1.2, 25), units: { piece: 100, plate: 250 } },
  { id: "fish-curry", name: "Fish curry", aliases: ["machli curry", "machher jhol", "fish"], per100: n(120, 13, 4, 6, 0.5, 400, 0.8, 30), units: { katori: 150 } },
  { id: "mutton-curry", name: "Mutton curry", aliases: ["goat curry", "mutton", "gosht"], per100: n(190, 15, 4, 13, 0.5, 400, 2, 20), units: { katori: 150 } },
  // Dairy and drinks
  { id: "curd", name: "Curd (dahi)", aliases: ["dahi", "yogurt", "yoghurt"], per100: n(61, 3.5, 4.7, 3.3, 0, 46, 0.1, 121), units: { katori: 150, cup: 200 } },
  { id: "milk", name: "Milk (toned)", aliases: ["doodh", "milk"], per100: n(58, 3.1, 4.7, 3, 0, 44, 0.1, 120), units: { glass: 200, cup: 150 } },
  { id: "buttermilk", name: "Buttermilk (chaas)", aliases: ["chaas", "chhach", "mattha", "majjige"], per100: n(25, 1.5, 2.5, 1, 0, 150, 0.1, 60), units: { glass: 250 } },
  { id: "lassi", name: "Lassi (sweet)", aliases: ["sweet lassi"], per100: n(90, 3, 14, 2.5, 0, 50, 0.1, 100), units: { glass: 250 } },
  { id: "tea", name: "Tea (milk + sugar)", aliases: ["chai", "chay"], per100: n(40, 1, 6, 1, 0, 15, 0.1, 35), units: { cup: 150 } },
  { id: "coffee", name: "Coffee (milk + sugar)", aliases: ["filter coffee", "kaapi"], per100: n(45, 1.5, 6.5, 1.5, 0, 20, 0.1, 50), units: { cup: 150 } },
  { id: "black-coffee", name: "Black coffee", aliases: ["americano", "black tea"], per100: n(2, 0.1, 0, 0, 0, 2), units: { cup: 150 } },
  { id: "whey", name: "Whey protein", aliases: ["protein shake", "whey"], per100: n(400, 78, 8, 6, 0, 250, 1, 400), units: { scoop: 32 } },
  // Breakfast
  { id: "poha", name: "Poha", aliases: ["pohe", "aval", "chivda poha"], per100: n(130, 2.5, 23, 3.5, 1.5, 280, 2, 15), units: { plate: 200, katori: 150 } },
  { id: "upma", name: "Upma", aliases: ["uppittu", "rava upma"], per100: n(140, 3.5, 20, 5, 1.5, 320, 0.8, 20), units: { plate: 200, katori: 150 } },
  { id: "idli", name: "Idli", aliases: ["idly"], per100: n(140, 4, 28, 0.5, 1, 250, 0.8, 15), units: { piece: 40 } },
  { id: "dosa", name: "Dosa (plain)", aliases: ["dosai", "plain dosa"], per100: n(165, 4, 26, 5, 1, 300, 0.9, 15), units: { piece: 85 } },
  { id: "masala-dosa", name: "Masala dosa", aliases: ["masala dosai"], per100: n(180, 4, 26, 7, 2, 330, 1, 20), units: { piece: 180 } },
  { id: "vada", name: "Medu vada", aliases: ["vada", "vadai", "uddina vade"], per100: n(300, 9, 30, 16, 4, 350, 1.8, 30), units: { piece: 50 } },
  { id: "oats", name: "Oats (dry)", aliases: ["rolled oats", "jai"], per100: n(389, 17, 66, 7, 10.6, 5, 4.7, 54), units: { cup: 40, tbsp: 8 } },
  { id: "oats-milk", name: "Oats porridge (with milk)", aliases: ["oatmeal", "oats with milk", "dalia"], per100: n(95, 4, 13, 3, 1.2, 50, 0.6, 100), units: { katori: 250 } },
  // Sabzi and salad
  { id: "aloo-sabzi", name: "Aloo sabzi", aliases: ["alu sabji", "potato curry", "aloo"], per100: n(110, 2, 15, 5, 2, 300, 0.6, 15), units: { katori: 150 } },
  { id: "mixed-veg", name: "Mixed veg sabzi", aliases: ["sabzi", "sabji", "veg curry", "mix veg"], per100: n(85, 2.5, 9, 4.5, 3, 300, 1, 40), units: { katori: 150 } },
  { id: "bhindi", name: "Bhindi sabzi", aliases: ["okra", "bhindi"], per100: n(90, 2, 8, 6, 3.5, 280, 0.8, 70), units: { katori: 150 } },
  { id: "salad", name: "Salad (cucumber, tomato, onion)", aliases: ["green salad", "kachumber"], per100: n(20, 1, 4, 0.2, 1.3, 5, 0.3, 15), units: { katori: 100, plate: 150 } },
  // Fruit and nuts
  { id: "banana", name: "Banana", aliases: ["kela"], per100: n(89, 1.1, 23, 0.3, 2.6, 1, 0.3, 5), units: { piece: 118 } },
  { id: "apple", name: "Apple", aliases: ["seb"], per100: n(52, 0.3, 14, 0.2, 2.4, 1, 0.1, 6), units: { piece: 180 } },
  { id: "orange", name: "Orange", aliases: ["santra", "mosambi"], per100: n(47, 0.9, 12, 0.1, 2.4, 0, 0.1, 40), units: { piece: 130 } },
  { id: "papaya", name: "Papaya", aliases: ["papita"], per100: n(43, 0.5, 11, 0.3, 1.7, 8, 0.3, 20), units: { katori: 150 } },
  { id: "mango", name: "Mango", aliases: ["aam"], per100: n(60, 0.8, 15, 0.4, 1.6, 1, 0.2, 11), units: { piece: 200 } },
  { id: "peanuts", name: "Peanuts (roasted)", aliases: ["moongphali", "groundnut", "shengdana"], per100: n(585, 24, 21, 50, 8, 6, 2.3, 54), units: { handful: 30 } },
  { id: "almonds", name: "Almonds", aliases: ["badam"], per100: n(579, 21, 22, 50, 12.5, 1, 3.7, 269), units: { handful: 12, piece: 1.2 } },
  { id: "peanut-butter", name: "Peanut butter", aliases: ["pb"], per100: n(588, 25, 20, 50, 6, 430, 1.9, 43), units: { tbsp: 16 } },
  // Snacks and extras
  { id: "biscuits", name: "Biscuits (glucose / marie)", aliases: ["biscuit", "cookies", "parle g", "marie"], per100: n(450, 7, 75, 14, 2, 350, 1.5, 30), units: { piece: 7 } },
  { id: "namkeen", name: "Namkeen (bhujia / mixture)", aliases: ["bhujia", "mixture", "chivda", "farsan"], per100: n(550, 13, 40, 38, 6, 1100, 3, 40), units: { handful: 25 } },
  { id: "samosa", name: "Samosa", aliases: ["samose"], per100: n(300, 5, 30, 18, 2.5, 400, 1.2, 20), units: { piece: 90 } },
  { id: "pickle", name: "Pickle (achar)", aliases: ["achar", "aachar", "mango pickle"], per100: n(200, 1, 7, 19, 2, 2900, 1, 20), units: { tbsp: 15, tsp: 5 } },
  { id: "ghee", name: "Ghee", aliases: ["desi ghee", "butter"], per100: n(900, 0, 0, 100, 0, 2), units: { tsp: 5, tbsp: 14 } },
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));
