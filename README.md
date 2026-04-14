# Fraud-Watch-SOEN341_Project_W26

## MealMajor — Meal Prep & Healthy Living Planner

### Overview

**MealMajor** is a web app designed for students to **plan meals**, **manage recipes**, and **get quick AI recipe ideas** from ingredients on hand.

### Problem

Students and busy users are often struggling with:

- **Time pressure**: no planning leads to longer prep time and last-minute decisions
- **Budget waste**: unclear grocery needs leads to unnecessary purchases
- **Unhealthy choices**: limited easy recipe options makes it so that fast food becomes the default

### Objective

Help users **simplify meal planning** and build an **efficient and healthier routine**.

### Key Features

- **Plan meals**: Weekly planner linked to your saved recipes (Supabase).
- **Manage recipes**: Create, search, filter, edit, and delete your own recipes.
- **AI recipe ideas**: Optional OpenAI-powered suggestions from a fridge-ingredient list (requires a local API key; see below).

### Repository layout (application code)

```text
MealMajor (repo root)
├── .github/workflows/ci.yml   # Runs `npm test` on push and pull_request
├── images/                    # Local images (backgrounds, etc.)
├── scripts/
│   ├── pages/                 # UI: DOM, events, navigation, page boot
│   ├── logic/                 # Pure helpers: validation, formatting, prompts
│   ├── services/              # Supabase + OpenAI fetch only
│   ├── supabase-init.js       # Creates window.__MEAL_MAJOR_SUPABASE__ (load after Supabase CDN)
│   └── supabaseClient.js      # ESM helper: getSupabase()
├── styles/                    # One CSS file per page (+ register.css)
├── tests/                     # Node unit tests for logic modules
├── *.html                     # Static pages
├── openai-config.local.example.js
├── package.json
├── package-lock.json
└── README.md
```

**Layering**

- **Pages** (`scripts/pages/`): `document`, `addEventListener`, rendering, redirects, loading states.
- **Logic** (`scripts/logic/`): No DOM, no Supabase, no `fetch`; easy to unit test.
- **Services** (`scripts/services/`): `getSupabase()` calls and OpenAI HTTP; no DOM.

Sprint documentation folders (`Sprint1`, `Sprint2`, …) and meeting minutes are unchanged.

### Running the app

This is a static **vanilla JS** front end. **Do not open the HTML files directly** (double-click or `file://` URLs). That gives origin `null`, which breaks ES module loading and triggers **CORS errors** for Supabase and other requests.

Serve the repo root over **http://** instead:

```bash
npm run dev
```

Then open **http://localhost:4173/login.html** (or the URL the terminal prints).

Alternatively:

```bash
npx --yes serve .
```

Load order in HTML:

1. Supabase CDN (`@supabase/supabase-js`)
2. `scripts/supabase-init.js` (non-module)
3. `type="module"` page script under `scripts/pages/`

### OpenAI (AI Recipe Idea page)

`ai-recipe-idea.html` sets `window.__MEAL_MAJOR_OPENAI_KEY__` to an empty string by default, then loads **`openai-config.local.js`** from the project root when present so your key is applied before the page module runs.

1. Copy `openai-config.local.example.js` to `openai-config.local.js` (or commit your key in a file you prefer).
2. Set `window.__MEAL_MAJOR_OPENAI_KEY__` to your key in that file.

If the local file is missing, you may see a 404 for `openai-config.local.js` in the network tab; the app still runs, but the AI page will show “not configured” until you add the file.

### Tests

Requires **Node.js 18+**.

```bash
npm test
```

Uses the built-in Node test runner (`node --test`) against files in `tests/`.

### Team Members and Roles

| Team Member | Student ID | Role(s) |
|-------------|-----------:|---------|
| Nadir Taleb (nadirtaleb2) | 40276506 | Backend Developer; Documentation |
| Hao Qi (hisanip) | 40105579 | Frontend Developer |
| Hanad-Keysse Mohamed Hassan (H-Keysse) | 40299566 | Repository; Frontend Developer |
| Djazy Faradj (Djazy-Faradj) | 40315411 | Backend Developer |
| Fahed Waheed (FahedWaheed8) | 40286415 | Sprint Planning & DevOps |
| Hadile Magramane (Hadile12) | 40316211 | DevOps |

### Development Approach

We follow an **Agile/Scrum** workflow using GitHub for version control, issue tracking, and sprint deliverables.
