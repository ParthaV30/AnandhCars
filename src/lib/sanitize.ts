/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  return sanitizeText(html);
}

/**
 * Sanitize plain text input (escape HTML entities)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return '';
  return sanitizeText(input.trim());
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-_]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Sanitize SQL-like input (basic protection)
 */
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Sanitize for use in SQL LIKE queries
 */
export function sanitizeLikeInput(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+()\-\s]/g, '');
}

/**
 * Validate and sanitize GSTIN
 */
export function sanitizeGSTIN(gstin: string): string {
  return gstin.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeForDisplay(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v =>
        typeof v === 'string' ? sanitizeForDisplay(v) : v
      );
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(body: T): T {
  return sanitizeObject(body);
}

/**
 * Create sanitized search query
 */
export function createSafeSearchQuery(query: string): string {
  return sanitizeText(query)
    .replace(/[%_]/g, '\\$&')
    .substring(0, 100);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(value: string | number, min?: number, max?: number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    throw new Error('Invalid number');
  }

  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`);
  }

  return num;
}

/**
 * Sanitize URL for safe redirect
 */
export function sanitizeRedirectUrl(url: string, allowedHosts: string[] = []): string {
  try {
    const parsed = new URL(url);

    // Only allow relative URLs or allowed hosts
    if (parsed.origin === 'null' || allowedHosts.includes(parsed.hostname)) {
      return parsed.pathname + parsed.search + parsed.hash;
    }

    return '/';
  } catch {
    return '/';
  }
}