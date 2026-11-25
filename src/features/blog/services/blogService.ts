
import { apiRequest } from "../../../shared/services/api";

// export interface BlogQueryParams {
//   search?: string;
//   ordering?: string;
//   page?: number;
//   page_size?: number;
//   category?: string | number;
//   tag?: string | number;
// }
export interface BlogQueryParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  category?: string | number;
  author?: string | number;
  tag?: string | number;
  status?: string;
  is_highlight?: boolean;
  is_trending?: boolean;
  published_after?: string;
  published_before?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const blogService = {
  // Blog posts
  getPosts: <T = unknown>(params?: BlogQueryParams) =>
    apiRequest<PaginatedResponse<T>>("/posts/", {
      params: params ? { ...params } : undefined,
    }),

  getPostBySlug: <T = unknown>(slug: string) =>
    apiRequest<T>(`/posts/${encodeURIComponent(slug)}/`),

  // Categories
  getCategories: <T = unknown>() =>
    apiRequest<PaginatedResponse<T>>("/categories/"),

  // Authors
  getAuthors: <T = unknown>() =>
    apiRequest<PaginatedResponse<T>>("/authors/"),

  // Events
  getEvents: <T = unknown>() =>
    apiRequest<PaginatedResponse<T>>("/events/"),
};
