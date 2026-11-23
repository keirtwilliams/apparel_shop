import fs from 'fs';
import path from 'path';

// Products: Curated Purgatory // Falling Flames Avant-Garde Apparel
// 4:5 aspect ratio images from high-end minimalist/dark streetwear fashion photography
const products = [
  {
    id: "p1111111-1111-4111-8111-111111111111",
    name: "Falling Flames Heavyweight Boxy Tee",
    slug: "falling-flames-heavyweight-boxy-tee",
    category: "Tops",
    price: 75.00,
    description: "Constructed from 290 GSM dry-touch organic combed cotton with stone-wash patina. Features a relaxed drop-shoulder cut, reinforced twin-needle 32mm ribbed collar band, and clean side split hems for an architectural drape.",
    material: "100% GOTS-certified Organic Combed Cotton (290 GSM)",
    fit_note: "Oversized, relaxed drop-shoulder silhouette. True to size for boxy aesthetic.",
    care: "Machine wash cold inside-out at 30°C. Line dry in shade. Do not tumble dry.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v101-1111-4111-8111-111111111111", color_name: "Washed Slate", color_hex: "#3E4348", size: "S", stock_count: 14 },
      { id: "v102-1111-4111-8111-111111111111", color_name: "Washed Slate", color_hex: "#3E4348", size: "M", stock_count: 22 },
      { id: "v103-1111-4111-8111-111111111111", color_name: "Washed Slate", color_hex: "#3E4348", size: "L", stock_count: 4 }, // Low stock <=5
      { id: "v104-1111-4111-8111-111111111111", color_name: "Washed Slate", color_hex: "#3E4348", size: "XL", stock_count: 0 }, // Out of stock
      { id: "v105-1111-4111-8111-111111111111", color_name: "Ash Chalk", color_hex: "#DDD9D1", size: "S", stock_count: 9 },
      { id: "v106-1111-4111-8111-111111111111", color_name: "Ash Chalk", color_hex: "#DDD9D1", size: "M", stock_count: 16 },
      { id: "v107-1111-4111-8111-111111111111", color_name: "Ash Chalk", color_hex: "#DDD9D1", size: "L", stock_count: 3 }, // Low stock <=5
      { id: "v108-1111-4111-8111-111111111111", color_name: "Ash Chalk", color_hex: "#DDD9D1", size: "XL", stock_count: 8 },
    ]
  },
  {
    id: "p2222222-2222-4222-8222-222222222222",
    name: "Pleated Relaxed Studio Trouser",
    slug: "pleated-relaxed-studio-trouser",
    category: "Bottoms",
    price: 155.00,
    description: "Tailored single-pleat trousers cut from Japanese tropical wool blend. Features a comfortable high-rise waist with hidden side adjusters, gentle taper toward the ankle, and interior French seams.",
    material: "60% Virgin Tropical Wool, 38% Recycled Poly, 2% Elastane",
    fit_note: "High-rise waist with relaxed thigh tapering to 18cm leg opening.",
    care: "Dry clean only or delicate hand wash cold. Cool iron with pressing cloth.",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v201-2222-4222-8222-222222222222", color_name: "Charred Onyx", color_hex: "#232323", size: "S", stock_count: 8 },
      { id: "v202-2222-4222-8222-222222222222", color_name: "Charred Onyx", color_hex: "#232323", size: "M", stock_count: 12 },
      { id: "v203-2222-4222-8222-222222222222", color_name: "Charred Onyx", color_hex: "#232323", size: "L", stock_count: 2 }, // Low stock
      { id: "v204-2222-4222-8222-222222222222", color_name: "Charred Onyx", color_hex: "#232323", size: "XL", stock_count: 7 },
      { id: "v205-2222-4222-8222-222222222222", color_name: "Sandrift Pumice", color_hex: "#C6BEB3", size: "S", stock_count: 5 }, // Low stock
      { id: "v206-2222-4222-8222-222222222222", color_name: "Sandrift Pumice", color_hex: "#C6BEB3", size: "M", stock_count: 11 },
      { id: "v207-2222-4222-8222-222222222222", color_name: "Sandrift Pumice", color_hex: "#C6BEB3", size: "L", stock_count: 6 },
      { id: "v208-2222-4222-8222-222222222222", color_name: "Sandrift Pumice", color_hex: "#C6BEB3", size: "XL", stock_count: 0 }
    ]
  },
  {
    id: "p3333333-3333-4333-8333-333333333333",
    name: "Purgatory Brutalist Gabardine Trench",
    slug: "purgatory-brutalist-gabardine-trench",
    category: "Outerwear",
    price: 310.00,
    description: "An unlined minimalist outerwear statement engineered from water-resistant bonded cotton gabardine. Minimalist concealed horn button placket, deep raglan sleeves, storm welt pockets, and rear inverted pleat.",
    material: "100% Weather-Treated Bonded Cotton Gabardine",
    fit_note: "Generous mid-calf length. Sized to layer comfortably over heavyweight hoodies.",
    care: "Specialist clean only. Wipe clean with damp sponge for minor spots.",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v301-3333-4333-8333-333333333333", color_name: "Dark Olive", color_hex: "#383E36", size: "S", stock_count: 6 },
      { id: "v302-3333-4333-8333-333333333333", color_name: "Dark Olive", color_hex: "#383E36", size: "M", stock_count: 4 }, // Low stock
      { id: "v303-3333-4333-8333-333333333333", color_name: "Dark Olive", color_hex: "#383E36", size: "L", stock_count: 8 },
      { id: "v304-3333-4333-8333-333333333333", color_name: "Dark Olive", color_hex: "#383E36", size: "XL", stock_count: 3 }, // Low stock
      { id: "v305-3333-4333-8333-333333333333", color_name: "Graphite", color_hex: "#2B2D2F", size: "S", stock_count: 7 },
      { id: "v306-3333-4333-8333-333333333333", color_name: "Graphite", color_hex: "#2B2D2F", size: "M", stock_count: 10 },
      { id: "v307-3333-4333-8333-333333333333", color_name: "Graphite", color_hex: "#2B2D2F", size: "L", stock_count: 1 }, // Low stock
      { id: "v308-3333-4333-8333-333333333333", color_name: "Graphite", color_hex: "#2B2D2F", size: "XL", stock_count: 5 }
    ]
  },
  {
    id: "p4444444-4444-4444-8444-444444444444",
    name: "Vibram Commando Lug Minimalist Derby",
    slug: "vibram-commando-lug-minimalist-derby",
    category: "Footwear",
    price: 225.00,
    description: "Constructed on an Italian last using full-grain matte calfskin leather paired with an ultra-lightweight Vibram Morflex lug sole. Goodyear welted construction allows for multi-year resoling.",
    material: "Full-Grain Italian Calfskin Leather, Vibram Morflex Rubber Outsole",
    fit_note: "Fits true to EU/US standard. Half sizes recommended to size down.",
    care: "Condition with neutral beeswax leather balm. Store with cedar shoe trees.",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v401-4444-4444-8444-444444444444", color_name: "Matte Black", color_hex: "#1A1A1A", size: "S", stock_count: 5 }, // Size 40/S
      { id: "v402-4444-4444-8444-444444444444", color_name: "Matte Black", color_hex: "#1A1A1A", size: "M", stock_count: 9 }, // Size 42/M
      { id: "v403-4444-4444-8444-444444444444", color_name: "Matte Black", color_hex: "#1A1A1A", size: "L", stock_count: 3 }, // Low stock
      { id: "v404-4444-4444-8444-444444444444", color_name: "Matte Black", color_hex: "#1A1A1A", size: "XL", stock_count: 4 }, // Low stock
      { id: "v405-4444-4444-8444-444444444444", color_name: "Raw Umber", color_hex: "#4D3B32", size: "S", stock_count: 2 },
      { id: "v406-4444-4444-8444-444444444444", color_name: "Raw Umber", color_hex: "#4D3B32", size: "M", stock_count: 6 },
      { id: "v407-4444-4444-8444-444444444444", color_name: "Raw Umber", color_hex: "#4D3B32", size: "L", stock_count: 0 },
      { id: "v408-4444-4444-8444-444444444444", color_name: "Raw Umber", color_hex: "#4D3B32", size: "XL", stock_count: 3 }
    ]
  },
  {
    id: "p5555555-5555-4555-8555-555555555555",
    name: "Seamless Heavy Gauge Merino Mockneck",
    slug: "seamless-heavy-gauge-merino-mockneck",
    category: "Tops",
    price: 125.00,
    description: "Knit on Japanese whole-garment 3D knitting machines from 19.5 micron ultra-fine Australian merino wool. 100% seam-free torso provides fluid movement with zero friction points.",
    material: "100% Extra-Fine Australian Merino Wool (19.5 Micron)",
    fit_note: "Tailored fit that skims the torso. Size up for a looser drape.",
    care: "Hand wash in cool water with wool detergent. Dry flat on a clean towel.",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v501-5555-4555-8555-555555555555", color_name: "Charcoal Marl", color_hex: "#333333", size: "S", stock_count: 11 },
      { id: "v502-5555-4555-8555-555555555555", color_name: "Charcoal Marl", color_hex: "#333333", size: "M", stock_count: 18 },
      { id: "v503-5555-4555-8555-555555555555", color_name: "Charcoal Marl", color_hex: "#333333", size: "L", stock_count: 15 },
      { id: "v504-5555-4555-8555-555555555555", color_name: "Charcoal Marl", color_hex: "#333333", size: "XL", stock_count: 5 },
      { id: "v505-5555-4555-8555-555555555555", color_name: "Ecru Wool", color_hex: "#E8E4DA", size: "S", stock_count: 8 },
      { id: "v506-5555-4555-8555-555555555555", color_name: "Ecru Wool", color_hex: "#E8E4DA", size: "M", stock_count: 12 },
      { id: "v507-5555-4555-8555-555555555555", color_name: "Ecru Wool", color_hex: "#E8E4DA", size: "L", stock_count: 2 },
      { id: "v508-5555-4555-8555-555555555555", color_name: "Ecru Wool", color_hex: "#E8E4DA", size: "XL", stock_count: 6 }
    ]
  },
  {
    id: "p6666666-6666-4666-8666-666666666666",
    name: "Architectural Cargo Pant",
    slug: "architectural-cargo-pant",
    category: "Bottoms",
    price: 170.00,
    description: "An austere reinterpretation of tactical utility. Low-profile bellows cargo pockets engineered flush to the leg seams. Cut from high-density organic ripstop cotton with articulated knee darts.",
    material: "100% High-Density Cotton Ripstop (240 GSM)",
    fit_note: "Mid-rise, articulated knee taper. Elasticated toggle hem cinch.",
    care: "Machine wash cold with similar darks. Hang dry. Warm iron if necessary.",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v601-6666-4666-8666-666666666666", color_name: "Pitch Black", color_hex: "#1E1E1E", size: "S", stock_count: 10 },
      { id: "v602-6666-4666-8666-666666666666", color_name: "Pitch Black", color_hex: "#1E1E1E", size: "M", stock_count: 14 },
      { id: "v603-6666-4666-8666-666666666666", color_name: "Pitch Black", color_hex: "#1E1E1E", size: "L", stock_count: 5 },
      { id: "v604-6666-4666-8666-666666666666", color_name: "Pitch Black", color_hex: "#1E1E1E", size: "XL", stock_count: 3 },
      { id: "v605-6666-4666-8666-666666666666", color_name: "Raw Pumice", color_hex: "#CBC7BD", size: "S", stock_count: 7 },
      { id: "v606-6666-4666-8666-666666666666", color_name: "Raw Pumice", color_hex: "#CBC7BD", size: "M", stock_count: 9 },
      { id: "v607-6666-4666-8666-666666666666", color_name: "Raw Pumice", color_hex: "#CBC7BD", size: "L", stock_count: 0 },
      { id: "v608-6666-4666-8666-666666666666", color_name: "Raw Pumice", color_hex: "#CBC7BD", size: "XL", stock_count: 4 }
    ]
  },
  {
    id: "p7777777-7777-4777-8777-777777777777",
    name: "Falling Flames Technical Overshirt",
    slug: "falling-flames-technical-overshirt",
    category: "Outerwear",
    price: 210.00,
    description: "Multi-season layering piece crafted from lightweight Taslan nylon with matte peach-skin finish. Matte snaps, twin hidden chest pockets, and laser-cut underarm eyelets for thermoregulation.",
    material: "100% Water-repellent Peach-Skin Taslan Nylon",
    fit_note: "Square, boxy overshirt cut designed to fit over a t-shirt or knit.",
    care: "Machine wash cold gentle. Do not bleach. Air dry only.",
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v701-7777-4777-8777-777777777777", color_name: "Mineral Taupe", color_hex: "#8B847A", size: "S", stock_count: 6 },
      { id: "v702-7777-4777-8777-777777777777", color_name: "Mineral Taupe", color_hex: "#8B847A", size: "M", stock_count: 15 },
      { id: "v703-7777-4777-8777-777777777777", color_name: "Mineral Taupe", color_hex: "#8B847A", size: "L", stock_count: 4 },
      { id: "v704-7777-4777-8777-777777777777", color_name: "Mineral Taupe", color_hex: "#8B847A", size: "XL", stock_count: 8 }
    ]
  },
  {
    id: "p8888888-8888-4888-8888-888888888888",
    name: "Molded Bio-EVA Minimalist Mule",
    slug: "molded-bio-eva-minimalist-mule",
    category: "Footwear",
    price: 90.00,
    description: "Single-pour bio-based sugarcane EVA foam slip-on mule. Sculpted anatomical footbed, zero-drop heel posture, and non-marking hexagonal traction channels.",
    material: "100% Bio-EVA SugarFoam™",
    fit_note: "Roomy relaxed forefoot. Designed to be worn with or without socks.",
    care: "Rinse clean with water and neutral soap. Air dry away from direct heat.",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "v801-8888-4888-8888-888888888888", color_name: "Clay Cement", color_hex: "#9C978D", size: "S", stock_count: 12 },
      { id: "v802-8888-4888-8888-888888888888", color_name: "Clay Cement", color_hex: "#9C978D", size: "M", stock_count: 19 },
      { id: "v803-8888-4888-8888-888888888888", color_name: "Clay Cement", color_hex: "#9C978D", size: "L", stock_count: 5 },
      { id: "v804-8888-4888-8888-888888888888", color_name: "Clay Cement", color_hex: "#9C978D", size: "XL", stock_count: 2 }
    ]
  }
];

// Realistic synthetic customer names and cities
const customers = [
  { name: "Elena Rostova", email: "elena.rostova@atelier-nord.com", city: "Makati City, Metro Manila" },
  { name: "Marcus Thorne", email: "marcus.thorne@designsync.io", city: "BGC, Taguig City" },
  { name: "Kaito Tanaka", email: "kaito.tanaka@tokyoworks.jp", city: "Cebu City, Cebu" },
  { name: "Soren Lindqvist", email: "soren@arkitekter.se", city: "Quezon City, Metro Manila" },
  { name: "Amara Vance", email: "amara.vance@studio-vance.co", city: "Pasig City, Metro Manila" },
  { name: "Julian Rossi", email: "j.rossi@milano-craft.it", city: "Mandaluyong City, Metro Manila" },
  { name: "Hannah Chen", email: "hannah.chen@archetype.design", city: "Davao City, Davao del Sur" },
  { name: "Gabriel Silva", email: "gabriel.silva@lisboastudio.pt", city: "San Juan, Metro Manila" },
  { name: "Nadia Al-Mansoor", email: "nadia.mansoor@qatar-foundry.com", city: "Alabang, Muntinlupa City" },
  { name: "Liam O'Connor", email: "liam.oc@dublindesign.ie", city: "Iloilo City, Iloilo" }
];

const paymentMethods = ["card", "gcash", "cod"];
const orderStatuses = ["delivered", "delivered", "delivered", "shipped", "pending", "refunded"];

// Generate 45 realistic orders distributed over the last 30 days
const now = new Date("2026-11-23T19:00:00Z");
const orders = [];
const orderItems = [];

// Flatten all available variants
const allVariants = [];
products.forEach(p => {
  p.variants.forEach(v => {
    allVariants.push({
      variant_id: v.id,
      product_id: p.id,
      product_name: p.name,
      category: p.category,
      price: p.price,
      color_name: v.color_name,
      size: v.size
    });
  });
});

for (let i = 1; i <= 46; i++) {
  const cust = customers[i % customers.length];
  // distribute between 0 and 29 days ago
  const daysAgo = (46 - i) * (28 / 46);
  const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  
  const paymentMethod = paymentMethods[i % paymentMethods.length];
  let status = orderStatuses[i % orderStatuses.length];
  // Older orders (>7 days) are almost all delivered or refunded
  if (daysAgo > 10 && status === 'pending') {
    status = 'delivered';
  }
  const paymentStatus = (status === 'refunded') ? 'refunded' : 'paid';
  
  const orderId = `o${String(i).padStart(7, '0')}-0000-4000-8000-${String(i).padStart(12, '0')}`;
  
  // 1 to 3 items per order
  const itemCount = (i % 3) + 1;
  let orderTotal = 0;
  const currentOrderItems = [];

  for (let j = 0; j < itemCount; j++) {
    const varIndex = (i * 7 + j * 13) % allVariants.length;
    const v = allVariants[varIndex];
    const qty = ((i + j) % 2) + 1;
    const unitPrice = v.price;
    orderTotal += unitPrice * qty;
    
    const itemId = `oi${String(i).padStart(6, '0')}-${String(j).padStart(4, '0')}-4000-8000-${String(i * 10 + j).padStart(12, '0')}`;
    const orderItemRecord = {
      id: itemId,
      order_id: orderId,
      variant_id: v.variant_id,
      product_id: v.product_id,
      product_name: v.product_name,
      category: v.category,
      color_name: v.color_name,
      size: v.size,
      quantity: qty,
      unit_price: unitPrice,
      created_at: orderDate.toISOString()
    };
    orderItems.push(orderItemRecord);
    currentOrderItems.push(orderItemRecord);
  }

  orders.push({
    id: orderId,
    user_id: null,
    customer_name: cust.name,
    customer_email: cust.email,
    shipping_address: `${100 + i * 4} Minimalist Avenue, Unit ${400 + i}, ${cust.city}`,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    status: status,
    total_amount: orderTotal,
    created_at: orderDate.toISOString(),
    items: currentOrderItems
  });
}

// Generate SQL Seed File
let sql = `-- ============================================================
-- MONOKROM SYNTHETIC SEED DATA (PRODUCTS, VARIANTS, 46 ORDERS)
-- ============================================================

-- Insert Products
INSERT INTO public.products (id, name, slug, category, price, description, material, fit_note, care, images)
VALUES
`;

const productRows = products.map(p => {
  const imagesArray = `ARRAY[${p.images.map(img => `'${img}'`).join(', ')}]`;
  return `('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.slug}', '${p.category}', ${p.price}, '${p.description.replace(/'/g, "''")}', '${p.material.replace(/'/g, "''")}', '${p.fit_note.replace(/'/g, "''")}', '${p.care.replace(/'/g, "''")}', ${imagesArray})`;
}).join(',\n');

sql += productRows + `\nON CONFLICT (id) DO NOTHING;\n\n`;

// Insert Product Variants
sql += `-- Insert Product Variants\nINSERT INTO public.product_variants (id, product_id, color_name, color_hex, size, stock_count)\nVALUES\n`;

const variantRows = [];
products.forEach(p => {
  p.variants.forEach(v => {
    variantRows.push(`('${v.id}', '${p.id}', '${v.color_name.replace(/'/g, "''")}', '${v.color_hex}', '${v.size}', ${v.stock_count})`);
  });
});

sql += variantRows.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

// Insert Orders
sql += `-- Insert Orders (Synthetic past 30 days)\nINSERT INTO public.orders (id, customer_name, customer_email, shipping_address, payment_method, payment_status, status, total_amount, created_at)\nVALUES\n`;

const orderSqlRows = orders.map(o => {
  return `('${o.id}', '${o.customer_name.replace(/'/g, "''")}', '${o.customer_email}', '${o.shipping_address.replace(/'/g, "''")}', '${o.payment_method}', '${o.payment_status}', '${o.status}', ${o.total_amount.toFixed(2)}, '${o.created_at}')`;
}).join(',\n');

sql += orderSqlRows + `\nON CONFLICT (id) DO NOTHING;\n\n`;

// Insert Order Items
sql += `-- Insert Order Items\nINSERT INTO public.order_items (id, order_id, variant_id, quantity, unit_price, created_at)\nVALUES\n`;

const orderItemSqlRows = orderItems.map(oi => {
  return `('${oi.id}', '${oi.order_id}', '${oi.variant_id}', ${oi.quantity}, ${oi.unit_price.toFixed(2)}, '${oi.created_at}')`;
}).join(',\n');

sql += orderItemSqlRows + `\nON CONFLICT (id) DO NOTHING;\n`;

fs.writeFileSync(path.join(process.cwd(), 'supabase', 'seed.sql'), sql, 'utf8');

// Also write initialData.json for local demo fallback
const initialData = {
  products,
  orders,
  orderItems
};

const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(
  path.join(dataDir, 'initialData.json'),
  JSON.stringify(initialData, null, 2),
  'utf8'
);

console.log(`Generated seed data successfully! Products: ${products.length}, Orders: ${orders.length}, Order Items: ${orderItems.length}`);
