# 🔐 Runaway — Modern Authentication Experience

> A modern, secure, and beautifully designed authentication experience built for real-world applications.

Runaway is a full-featured authentication project focused on providing users with a smooth, secure, and intuitive **Sign Up, Login, Session Management, and Profile experience**.

The project combines a modern frontend architecture with **Supabase-powered authentication**, email verification, user profiles, and persistent sessions to create an authentication flow that feels polished rather than generic.

---

## ✨ Why Runaway?

Authentication is often the first interaction a user has with an application.

Runaway was designed to make that first interaction:

- ⚡ Fast
- 🔒 Secure
- 🎨 Modern
- 📱 Responsive
- 🧩 Scalable
- ❤️ User-friendly

Instead of treating authentication as just a login form, Runaway focuses on the complete user journey — from creating an account to verifying an email and maintaining an authenticated session.

---

## 🚀 Features

### 🔑 Authentication

- ✅ User Registration
- ✅ User Login
- ✅ Secure Password Authentication
- ✅ Email Confirmation
- ✅ Persistent User Sessions
- ✅ Logout
- ✅ Authentication State Management
- ✅ Protected Application Routes

### 👤 User Profiles

- ✅ Display Name Support
- ✅ User Profile Data
- ✅ Profile Creation During Signup
- ✅ Authentication-linked User Profiles

### 🎨 User Experience

- ✨ Modern authentication interface
- 📱 Responsive design
- ⚡ Smooth authentication flow
- 🎯 Clear validation and error states
- 🧭 Protected route navigation
- 🖥️ Clean and component-based UI

### ☁️ Backend & Data

- 🔐 Supabase Authentication
- 🗄️ Supabase Database
- 🔄 Authentication state synchronization
- 🧩 Database-backed user profiles
- ⚙️ Cloud-based authentication infrastructure

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ⚛️ React | Frontend UI |
| 📘 TypeScript | Type-safe development |
| 🧭 TanStack Router | Application routing |
| ☁️ Supabase | Authentication & database |
| 🎨 CSS / Tailwind-based styling | UI & responsive design |
| ⚡ Vite / Modern tooling | Development & build workflow |
| 🔐 Lovable Cloud | Cloud authentication infrastructure |

---

## 🔐 Authentication Flow

Runaway follows a complete authentication lifecycle:

```text
                 ┌─────────────────┐
                 │   New User      │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │     Sign Up     │
                 │ Name + Email +  │
                 │    Password     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Email Confirm.  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Verified User  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      Login      │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Authenticated   │
                 │     Session     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Protected Area  │
                 └─────────────────┘
## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
