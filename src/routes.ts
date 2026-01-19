import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { isValidUrl, generateShortCode } from './utils';
import { ShortenRequest, ShortenResponse, StatsResponse, UrlsResponse } from './types';

const router = Router();

/**
 * POST /api/shorten
 * Creates a short URL from a long URL
 */
router.post('/api/shorten', (req: Request<{}, {}, ShortenRequest>, res: Response<ShortenResponse>) => {
  const { url } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' } as any);
  }

  // Generate unique short code
  let shortCode: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique short code' } as any);
    }
  } while (storage.exists(shortCode));

  // Store the URL entry
  const entry = {
    url,
    shortCode,
    createdAt: new Date().toISOString(),
    visits: 0
  };
  storage.save(entry);

  // Return short URL and code
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  res.status(201).json({ shortUrl, shortCode });
});

/**
 * GET /:code
 * Redirects to the original URL and increments visit count
 */
router.get('/:code', (req: Request, res: Response) => {
  const { code } = req.params;

  const entry = storage.findByShortCode(code);
  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' } as any);
  }

  // Increment visit count
  storage.incrementVisits(code);

  // Redirect to original URL
  res.redirect(entry.url);
});

/**
 * GET /api/stats/:code
 * Returns statistics for a short URL
 */
router.get('/api/stats/:code', (req: Request, res: Response<StatsResponse>) => {
  const { code } = req.params;

  const entry = storage.findByShortCode(code);
  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' } as any);
  }

  res.json({
    url: entry.url,
    visits: entry.visits,
    createdAt: entry.createdAt
  });
});

/**
 * GET /api/urls?page=1
 * Returns paginated list of all URLs
 */
router.get('/api/urls', (req: Request, res: Response<UrlsResponse>) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;

  if (page < 1) {
    return res.status(400).json({ error: 'Page number must be >= 1' } as any);
  }

  const result = storage.getAll(page, pageSize);

  res.json({
    urls: result.urls,
    total: result.total,
    page
  });
});

export default router;
