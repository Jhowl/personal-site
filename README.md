# JonathanCosta.dev

This project is a personal website/portfolio built with Vanilla JavaScript and bundled using [Vite](https://vitejs.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd jonathancosta.dev
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```
   Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will generate a `dist` folder containing the compiled assets (HTML, CSS, JS) optimized for deployment.

## Previewing Production Build

To locally preview the production build:

```bash
npm run preview
```

## Deployment

Since this is a static site (HTML/CSS/JS), it can be deployed to almost any hosting provider.

### Vercel (Recommended) & Netlify
1. Connect your Git repository to Vercel/Netlify.
2. The settings should be detected automatically:
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`
3. Deploy.

### GitHub Pages
You can deploy the contents of the `dist` folder to GitHub Pages. You may need to configure the `base` path in `vite.config.js` if deploying to a subdirectory.

### Traditional Web Server (Nginx, Apache, etc.)
1. Run `npm run build`.
2. Upload the contents of the `dist` folder to your server's public root directory (e.g., `/var/www/html`).
