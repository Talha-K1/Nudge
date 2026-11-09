import { ApiError } from '../api/client';

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `The server returned an error (${error.status}). Please try again.`;
  }
  return "Can't reach the server. Check your connection and try again.";
}