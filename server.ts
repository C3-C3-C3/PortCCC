import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Ensure uploads, public, and media-cache folders exist
const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const mediaCacheDir = path.join(process.cwd(), 'media-cache');
const dataFilePath = path.join(publicDir, 'portfolio-data.json');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(mediaCacheDir)) {
  fs.mkdirSync(mediaCacheDir, { recursive: true });
}

// Support JSON parsing with a large limit for base64 file uploads
app.use(express.json({ limit: '100mb' }));

// API endpoint to get portfolio data
app.get('/api/portfolio', (req, res) => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return res.json(JSON.parse(data));
    }
  } catch (err) {
    console.error('Error reading portfolio-data.json:', err);
  }
  // Return empty/defaults if file doesn't exist
  return res.json({ projects: null, customLogo: null });
});

// API endpoint to save portfolio data
app.post('/api/portfolio', (req, res) => {
  try {
    const { projects, customLogo } = req.body;
    fs.writeFileSync(dataFilePath, JSON.stringify({ projects, customLogo }, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error writing portfolio-data.json:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API endpoint to upload files via base64
app.post('/api/upload', (req, res) => {
  try {
    const { filename, fileData } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ error: 'Filename and fileData are required' });
    }

    // Clean filename to prevent path traversal
    const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeFilename}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write binary file from base64
    const buffer = Buffer.from(fileData, 'base64');
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;
    console.log(`Saved file: ${filePath} -> ${relativeUrl}`);
    return res.json({ url: relativeUrl });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ error: err.message });
  }
});


// API endpoint to proxy external images/videos (like Google Drive) with disk caching and range streaming
app.get('/api/proxy-image', async (req: express.Request, res: express.Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).send('URL required');
    
    const cleanUrl = url.trim();
    const hash = crypto.createHash('md5').update(cleanUrl).digest('hex');
    const cacheFilePath = path.join(mediaCacheDir, `${hash}.bin`);
    const metaFilePath = path.join(mediaCacheDir, `${hash}.meta`);

    // Ensure media is cached locally
    if (!fs.existsSync(cacheFilePath) || !fs.existsSync(metaFilePath)) {
      const response = await fetch(cleanUrl);
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch media: ' + response.statusText);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let contentType = response.headers.get('content-type') || 'video/mp4';
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        contentType = 'video/mp4';
      }

      fs.writeFileSync(cacheFilePath, buffer);
      fs.writeFileSync(metaFilePath, JSON.stringify({ contentType, size: buffer.length }));
    }

    const meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));
    const fileSize = fs.statSync(cacheFilePath).size;

    res.setHeader('Content-Type', meta.contentType || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Handle Range Requests (essential for HTML5 <video> elements)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      
      const stream = fs.createReadStream(cacheFilePath, { start, end });
      return stream.pipe(res);
    }

    res.setHeader('Content-Length', fileSize);
    const stream = fs.createReadStream(cacheFilePath);
    return stream.pipe(res);
  } catch (err: any) {
    console.error('Error proxying media:', err);
    return res.status(500).send(err.message);
  }
});

// Cache for external media types
const mediaTypeCache = new Map<string, 'video' | 'image'>();

// API endpoint to check if a URL is a video or image
app.get('/api/media-type', async (req: express.Request, res: express.Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const cleanUrl = url.trim();
    if (mediaTypeCache.has(cleanUrl)) {
      return res.json({ type: mediaTypeCache.get(cleanUrl) });
    }

    let targetUrl = cleanUrl;
    const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      targetUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    const response = await fetch(targetUrl, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    const isVideo = contentType.startsWith('video/') || /\.(mp4|webm|mov|ogg)($|\?)/i.test(cleanUrl);
    const mediaType = isVideo ? 'video' : 'image';
    
    mediaTypeCache.set(cleanUrl, mediaType);
    return res.json({ type: mediaType, contentType });
  } catch (err: any) {
    return res.json({ type: 'image', error: err.message });
  }
});

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Vite development middleware vs Static Production files
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
