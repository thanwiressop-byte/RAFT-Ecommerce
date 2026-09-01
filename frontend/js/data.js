/**
 * RAFT product catalog — demo data.
 * In production this array is served by GET /api/products from the backend
 * (see /backend/routes/products.js), which reads live stock from the database
 * instead of this static file. Kept here so the frontend runs standalone.
 */
const RAFT_PRODUCTS = [
  {
    id: "rf-101",
    name: "Current 3-Person Inflatable Raft",
    category: "Rafts",
    price: 4499,
    compareAt: 4999,
    stock: 6,
    rating: 4.8,
    reviews: 34,
    icon: "raft",
    short: "Self-bailing whitewater raft with reinforced PVC hull.",
    specs: {
      "Capacity": "3 adults",
      "Material": "1000D reinforced PVC",
      "Weight": "18.5 kg",
      "Inflation time": "~6 min (pump included)",
      "Warranty": "2 years"
    }
  },
  {
    id: "rf-102",
    name: "Drift 2-Person Touring Kayak",
    category: "Kayaks",
    price: 6299,
    stock: 4,
    rating: 4.6,
    reviews: 21,
    icon: "kayak",
    short: "Tandem sit-on-top kayak built for calm-water touring.",
    specs: {
      "Capacity": "2 adults + gear",
      "Length": "3.9 m",
      "Material": "Rotomoulded HDPE",
      "Max load": "180 kg",
      "Warranty": "5 years"
    }
  },
  {
    id: "rf-103",
    name: "Eddy Adjustable Paddle",
    category: "Paddles",
    price: 899,
    stock: 22,
    rating: 4.7,
    reviews: 58,
    icon: "paddle",
    short: "Lightweight fibreglass-blend paddle, adjusts 200–220cm.",
    specs: {
      "Length": "200–220 cm adjustable",
      "Material": "Fibreglass-reinforced blade",
      "Weight": "890 g",
      "Warranty": "1 year"
    }
  },
  {
    id: "rf-104",
    name: "Torrent CE-Rated Life Jacket",
    category: "Safety",
    price: 749,
    stock: 3,
    rating: 4.9,
    reviews: 76,
    icon: "vest",
    short: "CE buoyancy-rated PFD with quick-release buckle.",
    specs: {
      "Buoyancy": "50N, CE ISO 12402-5",
      "Sizes": "S–XXL",
      "Closure": "Quick-release side buckle",
      "Warranty": "2 years"
    }
  },
  {
    id: "rf-105",
    name: "Portage 40L Dry Bag",
    category: "Gear",
    price: 549,
    stock: 40,
    rating: 4.5,
    reviews: 44,
    icon: "bag",
    short: "Roll-top waterproof bag, keeps kit dry on any run.",
    specs: {
      "Capacity": "40 litres",
      "Material": "500D tarpaulin PVC",
      "Closure": "Roll-top, IPX8 rated",
      "Warranty": "1 year"
    }
  },
  {
    id: "rf-106",
    name: "Basecamp 2-Person Tent",
    category: "Camping",
    price: 2199,
    stock: 9,
    rating: 4.4,
    reviews: 19,
    icon: "tent",
    short: "Riverside camping tent, freestanding, 3-season.",
    specs: {
      "Capacity": "2 people",
      "Season rating": "3-season",
      "Packed weight": "2.4 kg",
      "Warranty": "1 year"
    }
  },
  {
    id: "rf-107",
    name: "Anchor River Sandal",
    category: "Apparel",
    price: 899,
    stock: 15,
    rating: 4.3,
    reviews: 27,
    icon: "sandal",
    short: "Grippy amphibious sandal for rocky put-ins.",
    specs: {
      "Sole": "Sticky-rubber, drainage channels",
      "Upper": "Quick-dry webbing",
      "Sizes": "UK 4–12",
      "Warranty": "6 months"
    }
  },
  {
    id: "rf-108",
    name: "Rapids 12L Waist Pack",
    category: "Gear",
    price: 649,
    stock: 2,
    rating: 4.6,
    reviews: 12,
    icon: "bag",
    short: "Waterproof waist pack for snacks, phone and first aid.",
    specs: {
      "Capacity": "12 litres",
      "Material": "TPU-coated ripstop",
      "Closure": "Welded seams, roll-top",
      "Warranty": "1 year"
    }
  },
  {
    id: "rf-109",
    name: "Current 6-Person Expedition Raft",
    category: "Rafts",
    price: 8999,
    stock: 3,
    rating: 4.9,
    reviews: 15,
    icon: "raft",
    short: "Multi-day expedition raft with cargo D-rings.",
    specs: {
      "Capacity": "6 adults + cargo",
      "Material": "1100D reinforced PVC",
      "Weight": "34 kg",
      "Warranty": "2 years"
    }
  },
  {
    id: "rf-110",
    name: "Solo Play Kayak",
    category: "Kayaks",
    price: 5499,
    stock: 7,
    rating: 4.5,
    reviews: 18,
    icon: "kayak",
    short: "Nimble single kayak built for rapids and play waves.",
    specs: {
      "Capacity": "1 adult",
      "Length": "2.4 m",
      "Material": "Rotomoulded HDPE",
      "Warranty": "5 years"
    }
  },
  {
    id: "rf-111",
    name: "Quickdry Paddle Jacket",
    category: "Apparel",
    price: 1349,
    stock: 11,
    rating: 4.4,
    reviews: 9,
    icon: "sandal",
    short: "Breathable splash jacket with taped seams.",
    specs: {
      "Material": "2.5-layer waterproof shell",
      "Fit": "Regular, adjustable cuffs",
      "Sizes": "XS–XXL",
      "Warranty": "1 year"
    }
  },
  {
    id: "rf-112",
    name: "Basecamp Camp Stove",
    category: "Camping",
    price: 999,
    stock: 13,
    rating: 4.2,
    reviews: 14,
    icon: "tent",
    short: "Compact folding stove for riverside cooking.",
    specs: {
      "Fuel": "Butane/propane mix canister",
      "Boil time": "~3 min per litre",
      "Packed weight": "310 g",
      "Warranty": "1 year"
    }
  }
];

const RAFT_CATEGORIES = ["Rafts", "Kayaks", "Paddles", "Safety", "Gear", "Camping", "Apparel"];

function raftFindProduct(id){
  return RAFT_PRODUCTS.find(p => p.id === id);
}
function raftFormatPrice(zar){
  return "R" + zar.toLocaleString("en-ZA");
}
