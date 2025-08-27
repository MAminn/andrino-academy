# PromoBanner Component Documentation

## مكون شريط العروض الترويجية

## 📋 **Overview**

A fully accessible, RTL-optimized promotional banner component that sticks to the top of the page with countdown timer, clipboard functionality, and persistent dismissal.

## 🎯 **Features**

### ✅ **Core Functionality**

- **Sticky positioning** above header with z-index 50
- **Countdown timer** with live updates and accessibility announcements
- **Clipboard copying** with visual feedback
- **Persistent dismissal** using localStorage
- **RTL layout** optimized for Arabic content

### ✅ **Accessibility**

- `aria-live="polite"` for countdown announcements
- `role="status"` for copy feedback
- Proper ARIA labels for all interactive elements
- Keyboard navigation support (ESC to close)
- Focus rings with brand colors

### ✅ **Responsive Design**

- Mobile-optimized layout
- Flexible content arrangement
- Proper spacing for RTL layouts

## 🔧 **Props Interface**

```typescript
interface PromoBannerProps {
  initialSeconds?: number; // Default: 900 (15 minutes)
  coupon?: string; // Default: "ANDRINO25"
  message?: string; // Default: "خصم %25 اليوم — استخدم الكوبون:"
}
```

## 💻 **Usage Examples**

### Basic Usage

```tsx
import PromoBanner from "./components/PromoBanner";

// Default configuration
<PromoBanner />;
```

### Custom Configuration

```tsx
<PromoBanner
  initialSeconds={1800} // 30 minutes
  coupon='SAVE30'
  message='عرض خاص — استخدم الكوبون:'
/>
```

### In Layout (Recommended)

```tsx
// app/layout.tsx
import PromoBanner from "./components/PromoBanner";

export default function RootLayout({ children }) {
  return (
    <html lang='ar' dir='rtl'>
      <body>
        <Providers>
          <PromoBanner /> {/* Above navbar */}
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

## 🎨 **Styling**

### Tailwind Classes Used

```css
/* Container */
.sticky .top-0 .z-50 .bg-brand-brown .text-white .py-2 .px-4

/* Layout */
.flex .items-center .justify-between .space-x-4 .rtl:space-x-reverse

/* Interactive Elements */
.hover:bg-brand-brown-700 .focus:ring-2 .focus:ring-white .focus:ring-offset-2

/* Timer Display */
.bg-brand-brown-800 .font-mono .tabular-nums

/* Copy Feedback */
.animate-fade-in .bg-green-600 .text-white
```

### Brand Colors Integration

- **Background**: `bg-brand-brown` (#7e5b3f)
- **Hover states**: `bg-brand-brown-700`
- **Timer background**: `bg-brand-brown-800`
- **Focus rings**: White with brand offset

## ⚙️ **State Management**

### LocalStorage Keys

```typescript
"andrino:promo:dismissed"; // Boolean flag for dismissal
```

### Component State

```typescript
const [isVisible, setIsVisible] = useState(false); // Visibility control
const [timeLeft, setTimeLeft] = useState(initialSeconds); // Countdown timer
const [copyFeedback, setCopyFeedback] = useState(""); // Copy status
const [isMounted, setIsMounted] = useState(false); // SSR safety
```

## 🎛️ **Interactive Features**

### 1. Countdown Timer

- Starts from `initialSeconds` prop
- Updates every second
- Auto-dismisses when reaching 0
- Announced to screen readers
- Formatted as MM:SS

### 2. Clipboard Copying

- Uses modern `navigator.clipboard.writeText()`
- Fallback for older browsers using `document.execCommand()`
- Visual feedback with "تم النسخ" message
- Automatic feedback clearing after 2 seconds

### 3. Dismissal System

- Click × button to dismiss
- Press ESC key to dismiss
- Saves state to localStorage
- Prevents re-appearance on page reload

### 4. Keyboard Navigation

```typescript
// Supported keyboard interactions
ESC key    → Dismiss banner
Tab        → Navigate between interactive elements
Enter      → Activate focused button
Space      → Activate focused button
```

## 📱 **Responsive Behavior**

### Desktop (≥768px)

- Full horizontal layout
- All elements visible
- Comfortable spacing

### Mobile (<768px)

- Compressed layout
- Smaller font sizes
- Touch-friendly tap targets

## 🔍 **Accessibility Features**

### ARIA Attributes

```tsx
// Banner container
role="banner"
aria-label="عرض ترويجي"

// Countdown timer
aria-live="polite"
aria-label="الوقت المتبقي MM:SS"

// Copy feedback
role="status"
aria-live="polite"

// Dismiss button
aria-label="إغلاق العرض الترويجي"
```

### Focus Management

- Visible focus rings
- Logical tab order
- Keyboard shortcuts
- Color contrast compliance

## 🚀 **Performance Optimizations**

### 1. SSR Safety

```typescript
// Prevents hydration mismatches
const [isMounted, setIsMounted] = useState(false);
if (!isMounted || !isVisible) return null;
```

### 2. Cleanup

```typescript
// Timer cleanup on unmount
useEffect(() => {
  return () => clearInterval(timer);
}, []);
```

### 3. Efficient Re-renders

- Minimal state updates
- Conditional rendering
- Event handler optimization

## 🧪 **Testing**

### Manual Testing Checklist

- [ ] Banner appears on page load
- [ ] Countdown timer updates correctly
- [ ] Copy button copies coupon code
- [ ] Dismiss button hides banner permanently
- [ ] ESC key dismisses banner
- [ ] LocalStorage persists dismissal
- [ ] Screen reader announcements work
- [ ] RTL layout displays correctly
- [ ] Mobile responsive design
- [ ] Focus states visible

### Test URLs

- **Homepage**: `http://localhost:3001/`
- **Demo Page**: `http://localhost:3001/promo-demo`

### Reset Testing State

```javascript
// Clear localStorage to show banner again
localStorage.removeItem("andrino:promo:dismissed");
window.location.reload();
```

## 🔧 **Customization**

### Custom Messages

```tsx
<PromoBanner message='عرض محدود — احصل على خصم:' coupon='WEEKEND50' />
```

### Extended Timer

```tsx
<PromoBanner
  initialSeconds={3600} // 1 hour
/>
```

### Different Styling (Override)

```tsx
// Custom CSS classes can be added via className prop if needed
// Currently styles are built-in for consistency
```

## 📁 **File Structure**

```
src/app/
├── components/
│   └── PromoBanner.tsx      # Main component
├── layout.tsx               # Integration point
├── promo-demo/
│   └── page.tsx            # Demo page
└── globals.css             # Brand colors support
```

## 🎉 **Integration Complete**

The PromoBanner component is now fully integrated and ready for production use:

1. ✅ **Component created** at `components/PromoBanner.tsx`
2. ✅ **Layout updated** to include banner above navbar
3. ✅ **Demo page created** at `/promo-demo`
4. ✅ **RTL optimized** with proper Arabic layout
5. ✅ **Accessibility compliant** with WCAG guidelines
6. ✅ **Brand consistency** with Andrino Academy colors

The banner will appear on all pages and provide a professional promotional experience for your users! 🚀
