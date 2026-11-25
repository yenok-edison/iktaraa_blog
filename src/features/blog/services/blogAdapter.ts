
import type {
    BlogPost,
    BlogCategory,
    BlogSection,
    MusicEvent,
} from "../data/blogs";

import type {
    ApiPost,
    ApiCategory,
    ApiMusicEvent,
// } from "./blogApi";
} from "../services/blogApi";

// Safely convert values to strings
function toText(value: unknown, fallback = ""): string {
    if (value === null || value === undefined) return fallback;
    return String(value);
}

// Format a date without accidentally changing its calendar day
function formatDate(value?: string | null): string {
    if (!value) return "";

    const datePart = value.slice(0, 10);
    const parts = datePart.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) return "";

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDuration(seconds?: number | string | null): string {
    const totalSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatEventTime(
    value?: string,
    timezone?: string
): string {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    try {
        return new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            ...(timezone ? { timeZone: timezone } : {}),
        }).format(date);
    } catch {
        return date.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}

function formatPrice(amount: number | string, currency = "INR"): string {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) return "";

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 0,
        }).format(numericAmount);
    } catch {
        return `${currency} ${numericAmount}`;
    }
}

// Convert a Django blog post into the existing frontend BlogPost format
export function adaptBlogPost(apiPost: ApiPost): BlogPost {
    const post = apiPost as any;

    const author = post.author_details || {};
    const category = post.category_details || {};
    const featuredImage = post.featured_image || {};
    const audio = post.audio_snippet || {};
    const stats = post.stats || {};

    const sections: BlogSection[] = (post.sections || []).map(
        (section: any) => {
            const firstQuote = section.quotes?.[0];

            return {
                heading: toText(section.heading),
                body: toText(section.body),
                quote: firstQuote?.quote || firstQuote?.text || undefined,
                quoteAuthor:
                    firstQuote?.author_name ||
                    firstQuote?.attribution ||
                    undefined,
                proTip: section.pro_tip || undefined,
                specs: (section.specifications || []).map((spec: any) => ({
                    label: toText(spec.label),
                    value: toText(spec.value),
                })),
            };
        }
    );

    const publishedAt = post.published_at || post.created_at || "";

    return {
        id: String(post.id),
        apiId: Number(post.id),
        slug: toText(post.slug),
        title: toText(post.title),
        category: toText(category.name || post.category_name, "Uncategorized"),
        shortDescription: toText(post.short_description),
        date: formatDate(publishedAt),
        isoDate: publishedAt ? publishedAt.slice(0, 10) : "",
        readTime: `${Number(post.read_time_minutes) || 0} min read`,
        likes: Number(stats.likes) || 0,
        views: Number(stats.views) || 0,
        // commentsCount: 0,
        commentsCount: Number(apiPost.comments_count) || 0,

        image: toText(featuredImage.url || post.featured_image_url),
        imageAlt: toText(
            post.image_alt || featuredImage.alt_text,
            post.title || "Blog image"
        ),
        imageCredit: featuredImage.credit || undefined,

        author: {
            name: toText(author.name || post.author_name, "Musee Musical"),
            avatar: toText(author.avatar_url || author.avatar),
            role: toText(author.role),
            bio: toText(author.bio),
        },

        tags: (post.tag_details || []).length
            ? post.tag_details.map((tag: any) => toText(tag.name))
            : (post.tags || []).map((tag: any) =>
                typeof tag === "string" ? tag : toText(tag.name)
            ),

        isHighlight: Boolean(post.is_highlight),
        highlightBadge: post.highlight_badge || undefined,
        isTrending: Boolean(post.is_trending),
        trendingRank: post.trending_rank ?? undefined,

        audioSnippet: audio
            ? {
                title: toText(audio.title),
                artist: toText(audio.artist),
                duration: formatDuration(audio.duration_seconds),
                genre: toText(audio.genre),
                src: toText(audio.media.url),
            }
            : undefined,

        content: {
            introduction: toText(post.introduction),
            highlights: (post.highlights || []).map((item: any) =>
                toText(item.text || item)
            ),
            sections,
            conclusion: toText(post.conclusion),
        },

        relatedIds: (post.related_posts || []).map((item: any) =>
            String(item.related_post?.id || item.id || "")
        ).filter(Boolean),
    };
}

// Convert Django categories into the existing frontend category format
export function adaptCategory(apiCategory: ApiCategory): BlogCategory {
    return {
        id: String(apiCategory.id),
        name: apiCategory.name,
        slug: apiCategory.slug,
        count: 0,
    };
}

// Convert a Django event into the existing frontend MusicEvent format
export function adaptMusicEvent(apiEvent: ApiMusicEvent): MusicEvent {
    const event = apiEvent as any;
    const startsAt = event.starts_at;
    const timezone = event.timezone_name;

    return {
        id: String(event.id),
        title: toText(event.title),
        date: formatDate(startsAt),
        time: formatEventTime(startsAt, timezone),
        location: toText(event.location),
        city: toText(event.city),
        genre: toText(event.genre),
        badge: toText(event.badge),
        price: formatPrice(event.price_amount, event.currency || "INR"),
        spotsLeft: Number(event.spots_left) || 0,
        registrationUrl: event.registration_url || null,
    };
}

// Convert complete API collections
export function adaptBlogPosts(posts: ApiPost[]): BlogPost[] {
    return posts.map(adaptBlogPost);
}

export function adaptCategories(
    categories: ApiCategory[]
): BlogCategory[] {
    return [
        { id: "all", name: "All Categories", slug: "all", count: 0  },
        ...categories.map(adaptCategory),
    ];
}

export function adaptMusicEvents(
    events: ApiMusicEvent[]
): MusicEvent[] {
    return events.map(adaptMusicEvent);
}
