# 📦 Packages Management System

## Overview
Complete CRUD system for managing subscription packages. Managers and CEOs can create, edit, and manage packages through the dashboard. The public-facing component automatically fetches and displays active packages.

---

## 🗂️ File Structure

```
├── prisma/schema.prisma          # Package model definition
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── packages/
│   │   │       ├── route.ts      # GET all, POST create
│   │   │       └── [id]/
│   │   │           └── route.ts  # GET one, PUT update, DELETE
│   │   ├── manager/
│   │   │   └── packages/
│   │   │       └── page.tsx      # Manager CRUD dashboard
│   │   └── packages/
│   │       └── page.tsx          # Public showcase page (example)
│   └── components/
│       └── packages/
│           └── PackagesDisplay.tsx  # 👈 USE THIS COMPONENT
```

---

## 🎯 For Frontend Engineers

### Quick Start

**1. Import the component:**

```tsx
import PackagesDisplay from '@/components/packages/PackagesDisplay';
```

**2. Use it anywhere:**

```tsx
export default function YourPage() {
  return (
    <div>
      <h1>Our Packages</h1>
      <PackagesDisplay />  {/* That's it! */}
    </div>
  );
}
```

**No props needed!** The component handles:
- ✅ Data fetching from API
- ✅ Loading states
- ✅ Error handling
- ✅ Filtering (only active packages shown)
- ✅ Price calculations (discount logic)
- ✅ Perks parsing (JSON to array)

---

## 🎨 Customizing the UI

The component in `src/components/packages/PackagesDisplay.tsx` has **basic styling** that you can easily modify:

### Current Structure:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {packages.map((pkg) => (
    <div className="border-2 border-blue-400 rounded-2xl p-6">
      {/* Badge */}
      {pkg.badge && <div>{pkg.badge}</div>}
      
      {/* Name */}
      <h3>{pkg.name}</h3>
      
      {/* Price (with discount logic) */}
      <div>
        {hasDiscount ? (
          <>
            <span>{discountedPrice}</span>
            <span className="line-through">{originalPrice}</span>
          </>
        ) : (
          <span>{price}</span>
        )}
      </div>
      
      {/* Age & Duration */}
      <div>{minAge}-{maxAge} سنوات</div>
      <div>{durationMonths} شهور - {sessionsPerLevel} حصة</div>
      
      {/* Perks with checkmarks */}
      {perks.map(perk => (
        <div>
          <CheckCircle />
          <span>{perk}</span>
        </div>
      ))}
      
      {/* CTA Button */}
      <button>اشترك الآن</button>
    </div>
  ))}
</div>
```

### What You Can Change:
- **Colors**: Change `border-blue-400`, `bg-blue-600`, etc.
- **Layout**: Swap grid for flex, change columns
- **Card Design**: Modify border radius, shadows, padding
- **Typography**: Font sizes, weights, colors
- **Button Style**: Background, hover effects, text
- **Spacing**: Gap between cards, internal padding

---

## 📊 Package Data Structure

Each package object has:

```typescript
interface Package {
  id: string;                    // Unique ID
  name: string;                  // e.g., "مستوى احترافي"
  price: number;                 // Original price
  discountedPrice: number | null; // Discounted price (null = no discount)
  minAge: number;                // Min age criteria
  maxAge: number;                // Max age criteria
  description: string;           // Curriculum details
  perks: string;                 // JSON array of benefits
  durationMonths: number;        // e.g., 12
  sessionsPerLevel: number;      // e.g., 48
  pricePerSession: number;       // Auto-calculated
  badge: string | null;          // e.g., "Best Value" or null
  order: number;                 // Display order
  isActive: boolean;             // Show/hide
}
```

---

## 🔐 Manager Dashboard

Managers and CEOs can access package management at:
```
/manager/packages
```

### Features:
- ✅ Create new packages
- ✅ Edit existing packages
- ✅ Delete packages
- ✅ Toggle active/inactive
- ✅ Reorder packages
- ✅ Add/remove perks
- ✅ Set discounts
- ✅ Add custom badges

### Navigation:
A button is added to the manager dashboard for easy access.

---

## 🔌 API Endpoints

### Public Access:
- `GET /api/packages` - Returns only active packages for students

### Manager/CEO Access:
- `GET /api/packages` - Returns all packages
- `POST /api/packages` - Create new package
- `GET /api/packages/:id` - Get single package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

---

## 💡 Example Usage Scenarios

### Scenario 1: Landing Page
```tsx
// app/page.tsx
import PackagesDisplay from '@/components/packages/PackagesDisplay';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PackagesDisplay />  {/* Display packages */}
      <ContactSection />
    </main>
  );
}
```

### Scenario 2: Dedicated Pricing Page
```tsx
// app/pricing/page.tsx
import PackagesDisplay from '@/components/packages/PackagesDisplay';

export default function PricingPage() {
  return (
    <div className="container">
      <h1>اختر الباقة المناسبة</h1>
      <p>باقات مرنة تناسب جميع الأعمار</p>
      <PackagesDisplay />
    </div>
  );
}
```

### Scenario 3: Custom Wrapper
```tsx
// app/enrollment/page.tsx
import PackagesDisplay from '@/components/packages/PackagesDisplay';

export default function EnrollmentPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl text-center mb-8">ابدأ رحلتك التعليمية</h1>
        <PackagesDisplay />
        <div className="text-center mt-8">
          <p>لديك استفسار؟ تواصل معنا على...</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Styling Tips

### Match Your Brand:
1. Open `src/components/packages/PackagesDisplay.tsx`
2. Find the color classes (e.g., `bg-blue-600`, `border-blue-400`)
3. Replace with your brand colors
4. Adjust spacing/sizing to match your design system

### Example Color Swap:
```tsx
// Before (Blue theme)
className="bg-blue-600 hover:bg-blue-700"

// After (Purple theme)
className="bg-purple-600 hover:bg-purple-700"
```

### Make it Responsive:
Current breakpoints:
- `grid-cols-1` - Mobile (1 column)
- `md:grid-cols-2` - Tablet (2 columns)
- `lg:grid-cols-3` - Desktop (3 columns)

Customize as needed!

---

## 🚀 Testing

### Test the Manager Dashboard:
1. Login as Manager/CEO
2. Navigate to `/manager/packages`
3. Create a test package with:
   - Name: "Test Package"
   - Price: 1000
   - Discounted Price: 800
   - Ages: 6-12
   - Duration: 12 months
   - Sessions: 48
   - Add 3-4 perks
   - Add a badge like "Best Value"
4. Save and verify it appears

### Test the Public Component:
1. Visit `/packages` (or wherever you placed `<PackagesDisplay />`)
2. Verify the package displays correctly
3. Check discount display (strikethrough on original price)
4. Verify badge appears
5. Test responsive design (resize browser)

---

## 📝 Notes

- **Authentication**: The API requires authentication. Public users see only active packages.
- **Performance**: Data is fetched client-side. Consider adding SWR/React Query for caching if needed.
- **SEO**: For better SEO, convert to Server Component and use `fetch` in RSC.
- **Internationalization**: All text is in Arabic. Modify strings if you need multi-language support.

---

## 🆘 Troubleshooting

**Issue**: Component shows "لا توجد باقات متاحة حالياً"
- **Solution**: Check if packages exist in database and are marked as `isActive: true`

**Issue**: Manager can't access `/manager/packages`
- **Solution**: Verify user role is "manager" or "ceo" in database

**Issue**: Styles look different
- **Solution**: Ensure Tailwind CSS is properly configured and classes are not being purged

---

## 🎓 Summary

**For Frontend Engineers:**
1. ✅ Import `PackagesDisplay` component
2. ✅ Place it in your page
3. ✅ Customize styles in the component file
4. ✅ Done! Data fetching is handled automatically

**For Managers:**
1. ✅ Login and go to `/manager/packages`
2. ✅ Create/Edit/Delete packages as needed
3. ✅ Changes appear immediately on the public site

That's it! The system is fully functional and ready to use. 🚀
