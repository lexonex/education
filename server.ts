
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Firebase configuration (matching lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyD2GZkyQBir2wQIBilCXogyT3gz8QRVKgI",
  authDomain: "edu-lexonex.firebaseapp.com",
  projectId: "edu-lexonex",
  storageBucket: "edu-lexonex.firebasestorage.app",
  messagingSenderId: "47491392874",
  appId: "1:47491392874:web:b2d040ba976f17bebe7113"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function startServer() {
  const server = express();
  const PORT = 3000;

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    server.use(vite.middlewares);
  } else {
    server.use(express.static(path.join(__dirname, 'dist')));
  }

  // Middleware to inject dynamic meta tags
  server.get('*all', async (req, res, next) => {
    const url = req.originalUrl;

    // Only handle HTML requests
    if (url.includes('.') && !url.endsWith('.html')) {
      return next();
    }

    try {
      // 1. Fetch settings from Firestore
      // Path: admin/root/system_config/branding
      const brandingDoc = await getDoc(doc(db, 'admin/root/system_config/branding'));
      const settings = brandingDoc.data() || {};

      const brandingName = settings.brandingName || 'EDU LEXONEX';
      const seoTitle = settings.seoTitle || brandingName;
      const seoDescription = settings.seoDescription || 'Pioneering dynamic multi-tenant education management through neural grid technologies.';
      
      let seoImage = settings.seoImage || settings.faviconURL || '/favicon.svg';
      
      // Construct base URL for absolute links
      const host = req.get('host');
      // In production/proxy, protocol might be reported as http, but we want https
      const protocol = host?.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      const currentUrl = `${baseUrl}${req.originalUrl}`;
      
      // Ensure absolute URL for social media crawlers
      if (seoImage.startsWith('/')) {
        seoImage = `${baseUrl}${seoImage}`;
      }

      // 2. Read index.html
      let templatePath = path.resolve(__dirname, 'index.html');
      if (process.env.NODE_ENV === 'production') {
        templatePath = path.resolve(__dirname, 'dist/index.html');
      }
      
      let template = fs.readFileSync(templatePath, 'utf-8');

      // 3. Transform HTML if in dev mode
      if (vite) {
        template = await vite.transformIndexHtml(url, template);
      }

      // 4. Replace placeholders
      let html = template
        .replace(/__SEO_TITLE__/g, seoTitle)
        .replace(/__SEO_DESCRIPTION__/g, seoDescription)
        .replace(/__SEO_IMAGE__/g, seoImage)
        .replace(/__BRANDING_NAME__/g, brandingName)
        .replace(/__CURRENT_URL__/g, currentUrl);

      // 5. Send the response
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e instanceof Error ? e.message : String(e));
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
