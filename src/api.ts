/**
 * Sevdesk API Client
 * Base HTTP client for sevdesk API with authentication handling
 */

const SEVDESK_API_BASE = "https://my.sevdesk.de/api/v1";

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
 * Fetch wrapper for sevdesk API with authentication
 */
export async function sevdeskFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = process.env.SEVDESK_API_TOKEN;
  if (!token) {
    throw new Error(
      "SEVDESK_API_TOKEN environment variable is not set. " +
        "Please configure your API token in the MCP server settings."
    );
  }

  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: token,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
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
  const token = process.env.SEVDESK_API_TOKEN;
  if (!token) {
    throw new Error(
      "SEVDESK_API_TOKEN environment variable is not set. " +
        "Please configure your API token in the MCP server settings."
    );
  }

  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: token,
      Accept: "application/json",
    },
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
  const token = process.env.SEVDESK_API_TOKEN;
  if (!token) {
    throw new Error(
      "SEVDESK_API_TOKEN environment variable is not set. " +
        "Please configure your API token in the MCP server settings."
    );
  }

  const url = `${SEVDESK_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: token,
      Accept: "application/json",
    },
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
  const token = process.env.SEVDESK_API_TOKEN;
  if (!token) {
    throw new Error(
      "SEVDESK_API_TOKEN environment variable is not set. " +
        "Please configure your API token in the MCP server settings."
    );
  }

  const url = `${SEVDESK_API_BASE}${endpoint}`;

  // Decode base64 to binary
  const binaryData = Buffer.from(fileContent, "base64");

  // Create a Blob from the binary data
  const blob = new Blob([binaryData]);

  // Create FormData and append the file
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: token,
      Accept: "application/json",
      // Note: Don't set Content-Type for FormData, browser/node will set it with boundary
    },
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
