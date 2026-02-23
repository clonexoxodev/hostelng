# HostelNG - Find Your Perfect Student Hostel

## Project info

A modern web application for discovering and booking verified student hostels near universities.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.


## Setup

1. **Install dependencies**
	 ```bash
	 npm install
	 ```
2. **Environment variables**
	 Create a `.env.local` file in the root with:
	 ```env
	 VITE_SUPABASE_URL=your-supabase-url
	 VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
	 ```
3. **Run the app**
	 ```bash
	 npm run dev
	 ```

## Features
- Students can browse and book hostels
- Hostel owners can list their properties
- Authentication via Supabase
- Accessible, responsive UI

## Pages
- Home
- Browse Hostels
- Hostel Details
- List Hostel
- Login/Register

## Supabase Setup
See below for SQL snippets to create tables and functions.

---

## SQL Snippets (Supabase)

### Users (auth handled by Supabase)
Supabase Auth manages users. To store extra profile info:
```sql
create table profiles (
	id uuid references auth.users not null primary key,
	full_name text,
	created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Hostels
```sql
create table hostels (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid references profiles(id),
	name text not null,
	description text,
	address text,
	city text,
	state text,
	price numeric not null,
	image_url text,
	created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Bookings
```sql
create table bookings (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references profiles(id),
	hostel_id uuid references hostels(id),
	start_date date not null,
	end_date date not null,
	status text default 'pending',
	created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Functions (optional)
- You may want a function to check hostel availability or return all bookings for a user.

---

## Product Requirements Document (PRD)

### Project: HostelNG - Student Hostel Booking Platform

#### Objective
Build a web platform for students to discover, book, and review hostels, and for hostel owners to list and manage their properties.

#### Core Features
- User authentication (Supabase)
- Student dashboard: browse/search hostels, book, view bookings
- Hostel owner dashboard: list hostel, manage listings, view bookings
- Hostel details: images, description, price, location, reviews
- Booking system: select dates, confirm, cancel
- Responsive, accessible UI

#### User Roles
- Student: browse, book, review
- Hostel Owner: list/manage hostels, view bookings

#### Data Model
- User (Supabase Auth + profile)
- Hostel (name, description, address, price, owner, images)
- Booking (user, hostel, dates, status)

#### Success Metrics
- Number of bookings
- Number of hostels listed
- User engagement (logins, searches)

#### Stretch Goals
- Reviews/ratings
- Payment integration
- Admin dashboard

---
