/**
 * File Utilities
 * Andrino Academy - Helper functions for file handling
 */

/**
 * Ensures a file URL is properly formatted for the API route
 * Handles legacy URLs that start with /uploads/ by prepending /api
 * @param fileUrl - The file URL from the database
 * @returns Properly formatted file URL for serving
 */
export function normalizeFileUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return "";
  
  // If already starts with /api/uploads/, return as-is
  if (fileUrl.startsWith("/api/uploads/")) {
    return fileUrl;
  }
  
  // If starts with /uploads/, prepend /api
  if (fileUrl.startsWith("/uploads/")) {
    return `/api${fileUrl}`;
  }
  
  // If it's an external URL (http:// or https://), return as-is
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  
  // Otherwise, assume it's a path and prepend /api/uploads/
  return `/api/uploads/${fileUrl}`;
}
