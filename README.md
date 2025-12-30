# Yanev Shop - Frontend

Modern e-commerce frontend built with Next.js 16, React 19, and Tailwind CSS.

## Features

- 🛍️ Product catalog with category filtering
- 🛒 Shopping cart functionality
- 💳 Stripe payment integration
- 👤 User authentication (Supabase Auth)
- 📦 Order management
- 🎨 Modern, responsive UI

## Tech Stack

- **Framework:** Next.js 16
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **TypeScript:** Full type safety

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Netlify

1. Push to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Set environment variables

## Project Structure

```
frontend/
├── app/              # Next.js app directory
│   ├── admin/       # Admin dashboard
│   ├── products/    # Product pages
│   ├── checkout/    # Checkout flow
│   └── ...
├── components/      # React components
├── context/         # React context providers
└── public/          # Static assets
```

## License

ISC

