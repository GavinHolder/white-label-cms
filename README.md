# Sonic Internet Website

A modern, dynamic website for Sonic Internet - a South African ISP based in the Overberg region. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 🏗️ Project Structure

```
sonic-website/
├── app/                      # Next.js App Router pages
│   ├── admin/               # CMS Admin Dashboard
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Main dashboard
│   │   ├── content/        # Content management
│   │   ├── media/          # Media library
│   │   ├── users/          # User management
│   │   └── settings/       # System settings
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── Sidebar.tsx     # Admin navigation
│   │   └── AdminLayout.tsx # Admin page wrapper
│   ├── layout/             # Layout components
│   │   ├── Navbar.tsx      # Main navigation
│   │   ├── Footer.tsx      # Site footer
│   │   └── Section.tsx     # Section wrapper
│   ├── sections/           # Page section components
│   │   ├── HeroCarousel.tsx
│   │   ├── TextImageSection.tsx
│   │   ├── StatsGrid.tsx
│   │   └── CardGrid.tsx
│   └── ui/                 # Reusable UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Container.tsx
│       └── Banner.tsx
├── lib/                     # Utility functions
│   ├── anim-bg/            # Animated background system (FLEXIBLE sections)
│   │   ├── types.ts        # AnimBgConfig, AnimBgLayer, AnimatorHandle interfaces
│   │   ├── defaults.ts     # Default configs for all 8 preset types
│   │   ├── animators.ts    # Animator functions (floating-shapes, gradient, particles, etc.)
│   │   └── index.ts        # Barrel re-export
│   └── auth-config.ts      # Authentication configuration
├── types/                   # TypeScript type definitions
│   ├── section.ts          # Section types
│   └── carousel.ts         # Carousel types
└── public/
    └── images/             # Static images

```

## 🎯 Key Features

### Frontend Website
- **Full-screen hero carousel** with image/video support and Framer Motion animations
- **Dynamic section-based architecture** for backend-controlled content
- **Tab-based navigation** with overlay pages (desktop)
- **Mobile-first responsive design** with smooth animations
- **7 section types**: Hero Carousel, Text+Image, Stats Grid, Card Grid, Banner, Table, Flexible (custom layout)
- **Animated backgrounds**: 8 configurable animation presets (floating shapes, gradients, particles, waves, parallax, 3D tilt, 3D scene, custom code) layered per FLEXIBLE section
- **Scroll-snap behavior** for smooth section navigation
- **Professional navbar** with scroll detection and animated transitions

### CMS Admin Dashboard
- **Bootstrap 5.3 professional interface** - Clean, emoji-free design
- **Authentication system** - Username/password with session management
- **Fixed sidebar navigation** - Collapsible menu structure
- **Content management** - Manage landing page sections and navbar items
- **Media library** - Upload and organize images/videos (planned)
- **User management** - Role-based permissions (planned)
- **Settings** - Site configuration (planned)

## 🔐 Admin Access

**Development Credentials:**
- URL: `http://localhost:3000/admin/login`
- Username: `admin`
- Password: `sonic2026`

**Note:** These are temporary hardcoded credentials for development. Replace with proper backend authentication before production deployment.

## 🎨 Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **React**: 19.2
- **TypeScript**: 5
- **Styling**: Tailwind CSS v4
- **Animations**: Anime.js v4 + Three.js
- **Fonts**: Geist Sans & Geist Mono
- **UI Framework**: Bootstrap 5.3 (Admin only)

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)** - Complete project changelog with all features and changes
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and project instructions for AI assistants
- **[BACKEND_CMS_SPECIFICATION.md](./BACKEND_CMS_SPECIFICATION.md)** - Complete backend API specification
- **[CMS_DASHBOARD_PLAN.md](./CMS_DASHBOARD_PLAN.md)** - Dashboard rollout and feature roadmap

## 🛠️ Development

### Architecture Patterns

**Component Organization:**
- `components/ui/` - Primitive, reusable components
- `components/layout/` - Layout-specific components
- `components/sections/` - Composed page sections
- `components/admin/` - Admin dashboard components

**Styling Approach:**
- Mobile-first responsive design (base styles for 320px+)
- Primary breakpoint: `md:` (768px) for desktop
- Tailwind CSS utility classes
- Bootstrap 5.3 for admin interface only

**Data Fetching:**
All components that fetch data must include `#TODO` comments defining:
1. The API endpoint to be called
2. Expected response format (TypeScript interface)
3. Required parameters or authentication

### Key Files

- **`app/layout.tsx`** - Root layout with Navbar/Footer (excluded for admin routes)
- **`app/page.tsx`** - Homepage with dynamic sections
- **`components/layout/Navbar.tsx`** - Main navigation with tab-page system
- **`lib/auth-config.ts`** - Authentication configuration and session types
- **`types/section.ts`** - Section type definitions for backend integration

## 🌐 Deployment

### Build the Project

```bash
npm run build
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=https://api.sonicinternet.co.za
NEXT_PUBLIC_SITE_URL=https://sonicinternet.co.za
```

### Deploy to Vercel

The easiest deployment option for Next.js:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/sonic-website)

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for other hosting options.

## 🔜 Roadmap

### Phase 1: Admin Dashboard (In Progress)
- [x] Authentication system
- [x] Dashboard layout and navigation
- [x] Landing page section manager UI
- [ ] Section edit modals for each type
- [ ] Drag-and-drop section reordering
- [ ] Save/publish workflow

### Phase 2: Backend Integration
- [ ] Connect to backend API
- [ ] Replace mock data with real endpoints
- [ ] Implement proper authentication with JWT
- [ ] Media upload functionality
- [ ] User management CRUD operations

### Phase 3: Advanced Features
- [ ] Navbar manager with 4-5 item limit
- [ ] Media library with image optimization
- [ ] Analytics dashboard
- [ ] SEO settings
- [ ] Multi-language support

See [CMS_DASHBOARD_PLAN.md](./CMS_DASHBOARD_PLAN.md) for detailed feature breakdown.

## 📄 License

Intellectual Property of Sonic Internet. All rights reserved.

## 🤝 Contributing

This is a private project for Sonic Internet. For access or questions, contact:
- Email: admin@sonicinternet.co.za
- Website: [sonicinternet.co.za](https://sonicinternet.co.za)

---

**Built with ❤️ for Sonic Internet - Connecting the Overberg**
