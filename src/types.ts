export interface UrlEntry {
  url: string;
  shortCode: string;
  createdAt: string;
  visits: number;
}

export interface ShortenRequest {
  url: string;
}

export interface ShortenResponse {
  shortUrl: string;
  shortCode: string;
}

export interface StatsResponse {
  url: string;
  visits: number;
  createdAt: string;
}

export interface UrlsResponse {
  urls: UrlEntry[];
  total: number;
  page: number;
}
