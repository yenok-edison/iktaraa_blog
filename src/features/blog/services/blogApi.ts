
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const API_ENDPOINTS = {
    posts: "/api/posts/",
    categories: "/api/categories/",
    authors: "/api/authors/",
    events: "/api/events/",
    readers: {
        me: "/api/readers/me/",
        login: "/api/readers/login/",
        logout: "/api/readers/logout/",
        passwordResetRequest: "/api/readers/password-reset/request/",
        passwordResetVerify: "/api/readers/password-reset/verify/",
        passwordResetConfirm: "/api/readers/password-reset/confirm/",
        resendOTP: "/api/readers/resend-otp/",
    },
    comments: (slug: string) =>
        `/api/posts/${encodeURIComponent(slug)}/comments/`,

    bookmarks: "/api/bookmarks/",

    bookmark: (id: number) =>
        `/api/bookmarks/${id}/`,
    viewCount: (slug: string) =>
    `/api/posts/${encodeURIComponent(slug)}/view/`,

    likes: (slug: string) =>
    `/api/posts/${encodeURIComponent(slug)}/likes/`,
};

export interface ApiPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiPost {
    id: number;
    slug: string;
    title: string;
    [key: string]: any;
}

export interface ApiCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface ApiAuthor {
    id: number;
    name: string;
    slug: string;
    role?: string;
    bio?: string;
    avatar_url?: string | null;
}

export interface ApiMusicEvent {
    id: number;
    title: string;
    slug: string;
    description?: string;
    starts_at: string;
    ends_at: string;
    timezone_name?: string;
    location?: string;
    city?: string;
    genre?: string;
    badge?: string;
    price_amount: number;
    currency: string;
    capacity?: number | null;
    spots_left?: number | null;
    status: string;
}

export interface BlogPostLikeResponse {
    detail?: string;
    liked: boolean;
    likes: number;
}


async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem("iktaraa_reader_token");

    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `API request failed (${response.status}): ${
                errorText || response.statusText
            }`
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}


function getCollection<T>(
    response: T[] | ApiPaginatedResponse<T>
): T[] {
    if (Array.isArray(response)) {
        return response;
    }

    return response.results || [];
}

export async function fetchBlogPosts(): Promise<
    ApiPaginatedResponse<ApiPost>
> {
    const response = await apiRequest<
        ApiPaginatedResponse<ApiPost> | ApiPost[]
    >(API_ENDPOINTS.posts);

    if (Array.isArray(response)) {
        return {
            count: response.length,
            next: null,
            previous: null,
            results: response,
        };
    }

    return response;
}

// Fetch one blog post using its slug
export async function fetchBlogPostBySlug(
    slug: string
): Promise<ApiPost> {
    return apiRequest<ApiPost>(
        `${API_ENDPOINTS.posts}${encodeURIComponent(slug)}/`
    );
}

// Fetch categories
export async function fetchCategories(): Promise<ApiCategory[]> {
    const response = await apiRequest<
        ApiCategory[] | ApiPaginatedResponse<ApiCategory>
    >(API_ENDPOINTS.categories);

    return getCollection(response);
}

// Fetch authors
export async function fetchAuthors(): Promise<ApiAuthor[]> {
    const response = await apiRequest<
        ApiAuthor[] | ApiPaginatedResponse<ApiAuthor>
    >(API_ENDPOINTS.authors);

    return getCollection(response);
}

// Fetch music events
export async function fetchMusicEvents(): Promise<ApiMusicEvent[]> {
    const response = await apiRequest<
        ApiMusicEvent[] | ApiPaginatedResponse<ApiMusicEvent>
    >(API_ENDPOINTS.events);

    return getCollection(response);
}


// ============================================================
// BLOG READER AUTHENTICATION
// ============================================================

export interface ApiReader {
    id: number;
    full_name: string;
    email: string;
    is_email_verified: boolean;
    created_at: string;
}


export interface ApiIktaraaProfile {
    id: number;
    user_id: number;
    full_name: string;
    mobile_number: string;
    email: string;
    is_email_verified: boolean;
    last_login_at: string | null;
    last_login_platform: string;
    created_at: string;
}


// Get saved authentication token
export function getReaderToken(): string | null {
    try {
        return localStorage.getItem("iktaraa_reader_token");
    } catch {
        return null;
    }
}

// Get current logged-in reader from Django
// export async function fetchReaderMe(): Promise<ApiReader> {
export async function fetchReaderMe(): Promise<ApiIktaraaProfile> {
    const token = getReaderToken();

    if (!token) {
        throw new Error("No reader authentication token found.");
    }

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.me}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Token ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Your session has expired. Please log in again.");
    }

    // return response.json();
    return response.json() as Promise<ApiIktaraaProfile>;
}

// Logout reader from Django
export async function logoutReader(): Promise<void> {
    const token = getReaderToken();

    if (!token) {
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.logout}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Token ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Unable to complete server logout.");
    }
}


// ----------------------------------------------------
// COMMENTS AND BOOKMARKS
// ----------------------------------------------------

export interface ApiComment {
    id: number;
    post: number;
    reader_name: string;
    content: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

export interface ApiBookmark {
    id: number;
    post: number;
    post_title: string;
    post_slug: string;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    results: T[];
}

interface CreateCommentResponse {
    detail: string;
    comment: ApiComment;
}

async function getApiError(response: Response): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (typeof data === "string") {
            return data;
        }

        return Object.entries(data)
            .map(([field, messages]) => {
                const message = Array.isArray(messages)
                    ? messages.join(" ")
                    : String(messages);

                return `${field}: ${message}`;
            })
            .join(" ");
    } catch {
        return `Request failed (${response.status}). Please try again.`;
    }
}

function getRequiredReaderToken(): string {
    const token = getReaderToken();

    if (!token) {
        throw new Error("Please sign in to continue.");
    }

    return token;
}

// Get approved comments for a published blog post.
// This endpoint is public.
export async function fetchPostComments(
    slug: string
): Promise<PaginatedResponse<ApiComment>> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.comments(slug)}`
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}

// Submit a comment as a verified reader.
export async function createPostComment(
    slug: string,
    content: string
): Promise<CreateCommentResponse> {
    const token = getRequiredReaderToken();

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.comments(slug)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ content }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}

// Get the current reader's bookmarks.
export async function fetchReaderBookmarks(): Promise<
    PaginatedResponse<ApiBookmark>
> {
    const token = getRequiredReaderToken();

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.bookmarks}`,
        {
            headers: {
                Authorization: `Token ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}

// Add a post to the current reader's bookmarks.
export async function addReaderBookmark(
    postId: number
): Promise<ApiBookmark> {
    const token = getRequiredReaderToken();

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.bookmarks}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ post: postId }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}

// Remove one of the current reader's bookmarks.
export async function removeReaderBookmark(
    bookmarkId: number
): Promise<void> {
    const token = getRequiredReaderToken();

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.bookmark(bookmarkId)}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Token ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }
}


// Increment views when a reader opens a blog post.
export async function incrementBlogPostView(
    slug: string
): Promise<{ message: string; views: number }> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.viewCount(slug)}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}


// Check whether the current reader has liked an article.
export async function fetchBlogPostLike(
    slug: string
): Promise<BlogPostLikeResponse> {
    return apiRequest<BlogPostLikeResponse>(
        API_ENDPOINTS.likes(slug)
    );
}

// Like an article.
export async function likeBlogPost(
    slug: string
): Promise<BlogPostLikeResponse> {
    return apiRequest<BlogPostLikeResponse>(
        API_ENDPOINTS.likes(slug),
        {
            method: "POST",
        }
    );
}

// Unlike an article.
export async function unlikeBlogPost(
    slug: string
): Promise<BlogPostLikeResponse> {
    return apiRequest<BlogPostLikeResponse>(
        API_ENDPOINTS.likes(slug),
        {
            method: "DELETE",
        }
    );
}



// ============================================================
// READER EMAIL OTP AUTHENTICATION
// ============================================================

export interface ReaderAuthResponse {
    detail: string;
    token: string;
    reader: ApiIktaraaProfile;
}


export interface ReaderLoginResponse {
    detail: string;
    token: string;
    reader: ApiIktaraaProfile;
}

export interface ReaderPasswordResetResponse {
    detail: string;
}

export interface ReaderOTPRequestResponse {
    detail: string;
    email?: string;
    expires_in_minutes?: number;
    resend_after_seconds?: number;
    retry_after_seconds?: number;
}

// Register a new reader and request an OTP.

export async function registerReader(
    fullName: string,
    email: string,
    mobileNumber: string,
    password: string,
    passwordConfirm: string
): Promise<ReaderOTPRequestResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/readers/register/`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                mobile_number: mobileNumber.trim(),
                password,
                password_confirm: passwordConfirm,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}



export async function resendReaderOTP(
    email: string
): Promise<ReaderOTPRequestResponse> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.resendOTP}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}

// Request an OTP for an existing reader.
// export async function requestReaderLoginOTP(
//     email: string
// ): Promise<ReaderOTPRequestResponse> {
//     const response = await fetch(
//         `${API_BASE_URL}/api/readers/login/`,
//         {
//             method: "POST",
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 email: email.trim().toLowerCase(),
//             }),
//         }
//     );

//     if (!response.ok) {
//         throw new Error(await getApiError(response));
//     }

//     return response.json();
// }

export async function loginReader(
    email: string,
    password: string,
    platform: "blog" | "events" = "blog"
): Promise<ReaderLoginResponse> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.login}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
                platform,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    const data: ReaderLoginResponse = await response.json();

    // Save the shared Django authentication token.
    localStorage.setItem("iktaraa_reader_token", data.token);

    return data;
}


// Verify OTP and establish the reader session.
export async function verifyReaderOTP(
    email: string,
    otp: string,
    platform: "blog" | "events" = "blog"
): Promise<ReaderAuthResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/readers/verify-otp/`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                platform,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    const data: ReaderAuthResponse = await response.json();

    // Save the real Django authentication token.
    localStorage.setItem("iktaraa_reader_token", data.token);

    return data;
}



export async function requestReaderPasswordReset(
    email: string
): Promise<ReaderPasswordResetResponse> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.passwordResetRequest}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}


export async function verifyReaderPasswordResetOTP(
    email: string,
    otp: string
): Promise<ReaderPasswordResetResponse> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.passwordResetVerify}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}


export async function confirmReaderPasswordReset(
    email: string,
    otp: string,
    password: string,
    passwordConfirm: string
): Promise<ReaderPasswordResetResponse> {
    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.readers.passwordResetConfirm}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                password,
                password_confirm: passwordConfirm,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    return response.json();
}
