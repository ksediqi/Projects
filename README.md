
<div align="center">

# 🚀 Full-Stack Web Development Portfolio & Showcase Hub

This portfolio showcases my journey as a Full-Stack Developer and reflects my commitment to continuous learning and improvement. The primary purpose of this implementation and its associated projects is to demonstrate my coding abilities, problem-solving skills, and technical growth.

Please note that these works are intended solely to showcase my skills and are not guaranteed to be free from bugs, errors, or other issues. As I continue to refine my craft, I welcome feedback and see every challenge as an opportunity to grow.



<p align="center">
  <strong>A curated collection of modern full-stack web applications, dynamic API integrations, and responsive UI/UX experiences built with Node.js, Express, EJS, and Vanilla CSS.</strong>
</p>

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-Templating-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)](https://ejs.co/)
[![Vanilla CSS](https://img.shields.io/badge/CSS3-Modern_Design_System-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![REST API](https://img.shields.io/badge/API-REST_Integrations-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://restfulapi.net/)

[Overview](#-overview) •
[Featured Projects](#-featured-projects) •
[Tech Stack](#-tech-stack) •
[Architecture](#-architectural-highlights) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[API Reference](#-api-reference)

---

</div>

## 📌 Overview

This repository serves as a **central full-stack engineering hub and interactive showcase** highlighting practical applications of web architecture, server-side rendering (SSR), REST API consumption, state management, and modern CSS UI design.

From high-fidelity interactive frontend interfaces to modular backend micro-services and third-party API consumers, each project demonstrates problem-solving ability, clean code practices, and scalable software structure.

---

## 🌟 Featured Projects

| Project | Description | Core Technologies | Route |
| :--- | :--- | :--- | :--- |
| **🌌 Space Tourism Multi-Page App** | Immersive multi-page exploration experience featuring destination data, crew rosters, and spaceflight technology details. | `EJS`, `CSS Grid/Flexbox`, `Responsive Design` | `/projects/space` |
| **📚 OpenLibrary & Book Manager** | Full-stack catalog exploration platform with book search, reading list organization, and direct OpenLibrary REST API synchronization. | `Node.js`, `Express`, `OpenLibrary API`, `Axios` | `/library` |
| **🎬 Movie & TMDB Explorer** | Dynamic cinema search and discovery engine consuming The Movie Database (TMDB) API with rich metadata and responsive media cards. | `Express.js`, `TMDB API`, `REST`, `EJS` | `/projects/movie` |
| **💳 Bankist Application** | Interactive banking dashboard simulator featuring account management, real-time balance calculations, money transfers, and loan requests. | `Vanilla JS`, `DOM Manipulation`, `Number Formatting` | `/projects/bankist` |
| **🗺️ Mapty Workout Tracker** | Geolocation-powered fitness log mapping running and cycling workouts interactively on responsive map layers. | `Geolocation API`, `Leaflet.js`, `OOP JavaScript` | `/projects/mapty` |
| **✍️ Blog Web Platform** | Content publishing engine with dynamic slug-based routing, structured article layouts, and modular partials. | `Express Router`, `SSR`, `Custom Typography` | `/projects/blogweba` |
| **💼 Portfolio Showcase** | Interactive developer portfolio featuring theme tokens, animated modals, popovers, and accessible navigation sidebars. | `CSS Custom Properties`, `Anime.js`, `Glassmorphism` | `/projects/portfolio` |

---

## 🛠️ Tech Stack

### **Backend & APIs**
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v5.x)
- **API Integration:** [Axios](https://axios-http.com/) & [node-fetch](https://github.com/node-fetch/node-fetch)
- **Data & Configuration:** `dotenv` for secure environment variable isolation

### **Frontend & Templating**
- **Templating Engine:** [EJS (Embedded JavaScript Templates)](https://ejs.co/) with reusable partials (`header`, `footer`, `navbar`)
- **Styling Architecture:** Modern **Vanilla CSS** with custom design tokens, CSS variables, Glassmorphism, and responsive media queries
- **Animations & Interactivity:** [Anime.js](https://animejs.com/), Popover API, CSS keyframe transitions

---

## 🏗️ Architectural Highlights

- **🔀 Modular Route Architecture:** Route handlers separated by domain (`routes/library.js`, `routes/api.js`, `routes/pages.js`, `routes/openlibraryapi.js`) for clear separation of concerns.
- **🎨 Unified CSS Design Tokens:** Global variables in `variables.css` for standardized color palettes, typography scales, elevation shadows, transitions, and z-index layers.
- **🛡️ Robust Middleware & Error Handling:** Centralized 4-parameter error handler, custom 404 middleware, and structured JSON health check probe (`/healthz`).
- **📱 Mobile-First Responsive Design:** Fully responsive navigation drawers, modal popovers, and grid-to-stack layouts optimized across all screen breakpoints.

---

## 📂 Project Structure

```text
PracticeProjects/
├── config/             # Data sources and configuration settings
├── database/           # Database connections and query helpers
├── models/             # Data models and schema definitions
├── public/             # Static client-side assets
│   ├── css/            # Modular style sheets (variables, navbar, animations, pages)
│   ├── images/         # Image assets, icons, and media
│   └── js/             # Client-side JavaScript modules and UI scripts
├── routes/             # Express route controllers and API handlers
│   ├── api.js          # REST API endpoints
│   ├── library.js      # Book library routing
│   ├── openlibraryapi.js # OpenLibrary external API consumer
│   └── pages.js        # Dynamic view routing
├── views/              # EJS server-rendered templates
│   ├── partials/       # Shared reusable components (navbar, header, footer)
│   ├── projects/       # Individual project view templates
│   └── main.ejs        # Main portfolio dashboard
├── .env.example        # Environment variable template
├── app.js              # Server entry point & Express middleware pipeline
└── package.json        # Project metadata and dependencies
```

---

## ⚡ Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/PracticeProjects.git
   cd PracticeProjects
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your keys:
   ```env
   PORT=4000
   NODE_ENV=development
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Launch the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

5. **Open in your browser:**
   Navigate to `http://localhost:4000` to view the live dashboard.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main portfolio dashboard and project directory |
| `/healthz` | `GET` | Health check probe (reports system status & TMDB key availability) |
| `/api/books` | `GET` | Retrieve book catalog entries |
| `/api/openlibrary/search` | `GET` | Proxy search requests to the OpenLibrary REST API |
| `/projects/:slug` | `GET` | Render specific showcase project view |

---

## 👨‍💻 Author

**Jamshid Sediqi**
- GitHub: [@ksediqi](https://github.com/ksediqi)
- Portfolio Hub: Running locally at `http://localhost:4000`

---

## 📄 License

This project is licensed under the [ISC License](LICENSE) — feel free to explore, learn, and build upon it.