# Andrino Academy Branding Guidelines

## Color Palette

### Primary Colors

#### Navy Dark Blue (`#343b50`)

- **Usage**: Headers, navigation, primary buttons, important text
- **Tailwind Classes**:
  - `bg-brand-blue` (default shade)
  - `text-brand-blue`
  - `border-brand-blue`
- **Variations**: `bg-brand-blue-50` to `bg-brand-blue-950`

#### Brown Dark Carmel (`#7e5b3f`)

- **Usage**: Secondary buttons, accents, warm elements
- **Tailwind Classes**:
  - `bg-brand-brown`
  - `text-brand-brown`
  - `border-brand-brown`
- **Variations**: `bg-brand-brown-50` to `bg-brand-brown-950`

#### Light Copper (`#c19170`)

- **Usage**: Highlights, hover states, decorative elements
- **Tailwind Classes**:
  - `bg-brand-copper`
  - `text-brand-copper`
  - `border-brand-copper`
- **Variations**: `bg-brand-copper-50` to `bg-brand-copper-950`

#### White (`#ffffff`)

- **Usage**: Clean backgrounds, cards, text on dark backgrounds
- **Tailwind Classes**:
  - `bg-brand-white`
  - `text-brand-white`

## Typography

### Font Families

- **Arabic**: `font-arabic` (Cairo, Tajawal)
- **Body Text**: `font-body` (Inter, Cairo)
- **Headings**: `font-heading` (Cairo, Inter)

### Font Sizes

- **Small**: `text-xs`, `text-sm`
- **Body**: `text-base`, `text-lg`
- **Headings**: `text-xl` to `text-6xl`

## Component Examples

### Primary Button

```jsx
<button className='bg-brand-blue hover:bg-brand-blue-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
  Primary Action
</button>
```

### Secondary Button

```jsx
<button className='bg-brand-brown hover:bg-brand-brown-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
  Secondary Action
</button>
```

### Accent Button

```jsx
<button className='bg-brand-copper hover:bg-brand-copper-700 text-white px-6 py-3 rounded-brand font-medium transition-colors'>
  Accent Action
</button>
```

### Card Component

```jsx
<div className='bg-brand-white rounded-brand-lg shadow-brand p-6 border border-gray-100'>
  <h3 className='text-brand-blue text-xl font-heading font-semibold mb-4'>
    Card Title
  </h3>
  <p className='text-gray-700 font-body'>Card content goes here...</p>
</div>
```

### Navigation Header

```jsx
<nav className='bg-brand-blue text-white shadow-brand-lg'>
  <div className='container mx-auto px-4 py-3'>
    <h1 className='text-2xl font-heading font-bold'>Andrino Academy</h1>
  </div>
</nav>
```

## Design Principles

### Accessibility

- All color combinations meet WCAG 2.1 AA contrast requirements
- Text on `brand-blue` backgrounds should use `text-white`
- Text on light backgrounds should use `text-gray-700` or darker

### Spacing

- Use consistent spacing: `p-4`, `p-6`, `p-8` for padding
- Margin classes: `m-4`, `m-6`, `m-8`
- Component spacing: `space-y-4`, `space-y-6`

### Border Radius

- Standard: `rounded-brand` (0.5rem)
- Large: `rounded-brand-lg` (0.75rem)

### Shadows

- Standard: `shadow-brand`
- Large: `shadow-brand-lg`
- Copper accent: `shadow-copper`

## Arabic/RTL Support

### RTL Classes

- Use `rtl:` prefix for RTL-specific styling
- Example: `rtl:text-right ltr:text-left`

### Font Selection

- Arabic content should use `font-arabic`
- Mixed content should use `font-body`

## Animation Classes

### Smooth Transitions

- `animate-fade-in`: Gentle fade in effect
- `animate-slide-up`: Slide up from bottom
- `transition-colors`: Smooth color transitions

## Usage in Components

### Example Layout

```jsx
export default function Layout({ children }) {
  return (
    <div className='min-h-screen bg-gray-50 font-body'>
      <nav className='bg-brand-blue text-white shadow-brand-lg'>
        {/* Navigation content */}
      </nav>
      <main className='container mx-auto px-4 py-8'>
        <div className='bg-brand-white rounded-brand-lg shadow-brand p-6'>
          {children}
        </div>
      </main>
    </div>
  );
}
```

This branding system provides a professional, accessible, and consistent design foundation for Andrino Academy.
