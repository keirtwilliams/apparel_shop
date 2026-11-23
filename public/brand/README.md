# Brand Assets Directory (`public/brand/`)

Place your custom brand logos and wordmark images in this folder:

### Supported Files:
1. **`logo.svg`** or **`logo.png`**
   - The brand icon / emblem / square monogram.
   - Recommended dimensions: `100x100px` to `512x512px` (square).
   - Displayed in the Navigation bar, Receipt header, and Footer.

2. **`logoname.svg`** or **`logoname.png`**
   - The brand name / logotype / wordmark graphic.
   - Recommended dimensions: `300x60px` to `600x120px` (horizontal banner format).
   - If provided, it can be displayed beside the logo icon.

---

### Customizing Brand Details
You can change the brand name, tagline, and toggle between text or image wordmark in:
📁 **[`src/config/brand.js`](../../src/config/brand.js)**

```javascript
export const brandConfig = {
  name: 'MONOKROM', // Your brand name
  tagline: 'Architectural Apparel & Functional Essentials',
  logoIcon: '/brand/logo.svg', // Path to your logo
  logoName: '/brand/logoname.svg', // Path to your wordmark image
  useImageLogoName: false, // Set to true to use logoname.svg/png instead of typography
};
```
