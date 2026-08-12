# Personal Financial Hub 💰

A modern, visually stunning, and highly interactive web application designed to help you take complete control of your personal finances. Track your income, manage expenses, and monitor your savings all in one beautiful dashboard.

## ✨ Features

- **📊 Comprehensive Dashboard:** Get a real-time overview of your financial health, including total income, expenses, and remaining balances.
- **💸 Expense Tracking:** Easily log expenses with detailed categorization, payment methods, and optional receipt attachments.

- **🧾 Bills & Subscriptions:** Manage recurring bills and subscriptions. Mark them as paid to automatically generate linked expense records.
- **💰 Salary & Savings:** Track your monthly salary and record global savings ledger entries to monitor your growing wealth.
- **🌙 Automatic Dark/Light Mode:** Seamlessly adapts to your system's theme preference with beautifully curated, modern glassmorphism aesthetics.
- **🔐 Secure Authentication:** Robust user authentication and secure data storage powered by Supabase.

## 🛠 Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (with custom utility classes and native dark mode support)
- **Animations:** Framer Motion for smooth, interactive micro-animations
- **Icons:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Auth)
- **3D Elements:** Spline for stunning visual components

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/klaayd39/personal-financial-hub.git
   cd "Personal Financial Hub"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup:
   Run the `supabase_migration.sql` script in your Supabase SQL Editor to ensure all necessary tables (`bills`, `expenses`, `incomes`, `salaries`, `savings`) and Row Level Security (RLS) policies are correctly configured.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

## 🎨 Design Philosophy

The Personal Financial Hub prioritizes **Visual Excellence**. By leveraging modern web design practices—such as vibrant yet harmonious color palettes, sleek dark modes, glassmorphism panels, and dynamic micro-animations—the application provides a premium, highly engaging user experience that makes managing finances a delight rather than a chore.
