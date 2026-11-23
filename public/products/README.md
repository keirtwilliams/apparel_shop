# Product & Garment Images (`public/products/`)

Drop your shirt, hoodie, and garment photos directly into this folder!

---

### 1. Recommended Image Specs (4:5 Aspect Ratio)
For optimal high-fashion e-commerce presentation:
* **Aspect Ratio:** `4:5` vertical (e.g., `800 x 1000px`, `1200 x 1500px`, or `1600 x 2000px`).
* **Formats:** `.jpg`, `.png`, `.webp`.
* **Naming tip:** Use clear filenames like:
  * `falling-flames-tee-front.jpg`
  * `falling-flames-tee-back.jpg`
  * `purgatory-hoodie-front.png`

---

### 2. How to Link Them to Your Products

Open **[`src/data/initialData.json`](../../src/data/initialData.json)** and update the `"images"` array of any product:

```json
{
  "id": "p1111111-1111-4111-8111-111111111111",
  "name": "Falling Flames Heavyweight Boxy Tee",
  "slug": "falling-flames-heavyweight-boxy-tee",
  "category": "Tops",
  "price": 75.00,
  "images": [
    "/products/your-shirt-front.jpg",
    "/products/your-shirt-back.jpg"
  ]
}
```

*Paths starting with `/products/...` automatically point to this `public/products/` folder!*

---

### 3. If You Are Using Supabase Storage
You can also upload images directly to your Supabase public bucket:
* Bucket name: **`product-images`**
* Paste the public URL directly into the `"images"` array in Supabase or `initialData.json`.
