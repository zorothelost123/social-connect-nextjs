# SocialConnect - Next.js Social Media Platform

A modern, full-stack social media application built with Next.js 14, Supabase, and Gemini AI. This platform features real-time interactions, AI-powered content refinement, and a premium subscription model.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Radix UI (Shadcn UI primitives)
- **Form Handling**: React Hook Form + Zod

### Backend & Infrastructure
- **BaaS**: Supabase (Database, Authentication, Storage)
- **Real-time**: Supabase Postgres Changes (Websockets)
- **Server Logic**: Next.js Server Components & API Routes
- **Payments**: Stripe (Subscription management)

### AI Integration
- **Model**: Google Gemini 1.5 Flash
- **Features**: AI Content Refinement for social media posts

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/              # Backend API endpoints (AI, Auth, Posts, Stripe)
│   ├── feed/             # Main social feed page
│   ├── profile/          # User profiles and settings
│   └── (auth)/           # Login and Registration routes
├── components/           # Reusable UI components
│   ├── feed/             # Feed-specific components (Suggested users, etc.)
│   ├── layout/           # Sidebar, Navigation, Logo
│   ├── post-card.tsx     # Complex component for displaying & interacting with posts
│   └── post-composer.tsx # AI-integrated post creation component
├── lib/                  # Utilities and shared logic
│   ├── supabase/         # Supabase client/server/admin configurations
│   └── utils.ts          # Tailwind merge and common helper functions
├── actions/              # (Placeholder) For Future Server Actions
└── types/                # TypeScript interfaces and definitions
```

---

## 🌟 Core Features

### 1. Authentication & User Profiles
- **Secure Auth**: Powered by Supabase Auth with email/password and metadata support.
- **Auto-Profile Creation**: Database triggers automatically create a profile entry for every new user.
- **Profile Customization**: Users can update their bio, username, and website.
- **Pro Status**: "Crown" badge for subscribed users.

### 2. The Dynamic Feed
- **Real-time Updates**: Post likes and comment counts update instantly without page refreshes using Supabase Realtime.
- **Infinite Scrolling/Pagination**: Efficiently loads the latest posts.
- **Suggested Users**: Sidebar widget to discover new people to follow.

### 3. AI-Powered Post Creation
- **Smart Refinement**: Uses **Gemini 1.5 Flash** to rewrite draft posts into more engaging, professional content.
- **Media Support**: Upload images directly to Supabase Storage.
- **Character Limit**: Enforces social media standards (280 characters).

### 4. Social Interactions
- **Liking System**: Optimistic updates for a snappy user experience.
- **Commenting**: Real-time comment threads on every post.
- **Follow/Unfollow**: Build your network with follow functionality.
- **Post Management**: Owners can delete their own posts.

### 5. Premium Subscriptions (Stripe)
- **Monetization**: Integrated Stripe Checkout for "Pro" subscriptions.
- **Webhooks**: Automatically updates user status in the database upon successful payment.

---

## 🛠 Database & Security (Supabase)

### Tables
- `profiles`: Core user data (username, bio, avatar, is_pro).
- `posts`: Content, image URLs, and cached interaction counts.
- `likes` & `comments`: Relational data connecting users and posts.
- `follows`: Managing the social graph.

### Security
- **RLS (Row Level Security)**: Strict policies ensure users can only edit their own content while keeping posts public for viewing.
- **Database Triggers**: Automated functions handle:
  - Synchronizing `posts_count` on profile table.
  - Synchronizing `like_count` and `comment_count` on posts table.
  - Initializing profiles on sign-up.

---

## 🎨 UI/UX Highlights
- **Glassmorphism**: Modern sidebar and card designs using blurred backgrounds.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile (with a custom mobile bottom nav).
- **Dark Mode Support**: Seamless theme switching with `next-themes`.
- **Interactive States**: Smooth hover effects and entry animations via Framer Motion.

---

## 🎬 Suggested Loom Video Flow
1. **Intro**: Start at the Landing Page, explaining the tech stack (Next.js + Supabase).
2. **Auth**: Quickly show the Login/Register flow.
3. **Feed**: Show the main feed, point out the Real-time updates (like a post and show how it updates).
4. **AI Magic**: Draft a simple post, click "AI Refine", and show the Gemini-powered transformation.
5. **Media**: Attach an image and publish the post.
6. **Profile**: Go to your profile, show the stats (Post count, Followers).
7. **Premium**: Click on "Go Pro" to show the Stripe integration.
8. **Code Walkthrough**: Briefly show the project structure and the `RefineRoute.ts` for the AI logic.
