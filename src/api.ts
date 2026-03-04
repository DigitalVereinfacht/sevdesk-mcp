/**
 * Sevdesk API Client
 * Base HTTP client for sevdesk API with authentication, retry logic, and rate limiting
 */

const SEVDESK_API_BASE = "https://my.sevdesk.de/api/v1";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export interface SevdeskApiResponse<T> {
  objects: T[];
}

export interface SevdeskSingleResponse<T> {
  objects: T | T[];
}

/**
 * Extract single object from response (handles both array and direct object)
 */
export function extractSingleObject<T>(response: SevdeskSingleResponse<T>): T {
  if (Array.isArray(response.objects)) {
    return response.objects[0];
  }
  return response.objects;
}

/**
 * Get API token or throw
 */
function getToken(): string {
  const token = process.env.SEVDESK_API_TOKEN;
  if (!token) {
    throw new Error(
      "SEVDESK_API_TOKEN environment variable is not set. " +
        "Please configure your API token in the MCP server settings."
    );
  }
  return token;
}

/**
 * Build common headers for all API requests
 */
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: getToken(),
    Accept: "application/json",
    ...extra,
  };

  const apiVersion = process.env.SEVDESK_API_VERSION;
  if (apiVersion) {
    headers["X-Version"] = apiVersion;
  }

  return headers;
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if a status code is retryable (429 rate limit or 5xx server error)
 */
function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Get retry delay from response headers or calculate exponential backoff
 */
function getRetryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Execute a fetch request with retry logic for 429/5xx responses
 */
async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);

    if (response.ok || !isRetryable(response.status) || attempt === MAX_RETRIES) {
      return response;
    }

    lastResponse = response;
    const delay = getRetryDelay(response, attempt);
    await sleep(delay);
  }

  /* v8 ignore next -- unreachable: loop always returns on attempt === MAX_RETRIES */
  return lastResponse!;
}

/**
 * Fetch wrapper for sevdesk API with authentication and retry
 */
export async function sevdeskFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetchWithRetry(url, {
    ...options,
    headers: buildHeaders({
      "Content-Type": "application/json",
      ...options?.headers as Record<string, string>,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sevdesk API error (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Build query string from optional parameters
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return filtered.length > 0 ? `?${filtered.join("&")}` : "";
}

/**
 * POST request to sevdesk API
 */
export async function sevdeskPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  return sevdeskFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request to sevdesk API
 */
export async function sevdeskPut<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  return sevdeskFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request to sevdesk API
 */
export async function sevdeskDelete(endpoint: string): Promise<void> {
  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetchWithRetry(url, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sevdesk API error (${response.status}): ${errorText || response.statusText}`
    );
  }
}

/**
 * Fetch PDF content from sevdesk API (returns base64)
 */
export async function sevdeskFetchPdf(endpoint: string): Promise<string> {
  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetchWithRetry(url, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sevdesk API error (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json() as { objects: { content: string } };
  return data.objects.content;
}

/**
 * Response from voucher file upload
 */
export interface VoucherFileUploadResponse {
  filename: string;
  pages?: number;
  mimeType?: string;
  originMimeType?: string;
  contentHash?: string;
}

/**
 * Upload file to sevdesk API (multipart/form-data)
 * Used for attaching receipts/documents to vouchers
 */
export async function sevdeskUploadFile(
  endpoint: string,
  fileContent: string, // base64 encoded
  fileName: string
): Promise<VoucherFileUploadResponse> {
  const url = `${SEVDESK_API_BASE}${endpoint}`;

  // Decode base64 to binary
  const binaryData = Buffer.from(fileContent, "base64");

  // Create a Blob from the binary data
  const blob = new Blob([binaryData]);

  // Create FormData and append the file
  const formData = new FormData();
  formData.append("file", blob, fileName);

  // Build headers without Content-Type (FormData sets it with boundary)
  const headers = buildHeaders();

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sevdesk API error (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json() as { objects: VoucherFileUploadResponse };
  return data.objects;
}
