import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { HatchDivider } from '../components/layout/HatchDivider';
import { SITE_CONFIG } from '../components/site/SiteShell';
import { BLOG_META } from '../data/site';
import { POSTS } from '../data/posts';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * The blog index, on its own route.
 *
 * Same spine as the home page — one narrow column, hatch dividers running
 * full-bleed past it — so moving between the two reads as one site rather than
 * two. Post bodies aren't built yet; this lists what's in `data/posts.ts`.
 */
export function BlogPage() {
  return (
    <div id="top" className="bg-ink min-h-[100dvh] w-full">
      <Header />

      <main className="pt-14 pb-32">
        <div style={{ height: SITE_CONFIG.sectionGap }} />

        <div className="mx-auto w-full max-w-[640px] px-6">
          <p className="tracking-heading text-sub mb-8 flex items-center gap-3">
            <span className="text-acid" aria-hidden>
              {BLOG_META.marker}
            </span>
            <span className="text-bone/70 lowercase">{BLOG_META.label}</span>
          </p>

          <h1 className="text-bone tracking-heading text-title mb-4">{BLOG_META.title}</h1>
          <p className="text-bone/60 tracking-body text-body max-w-[520px]">{BLOG_META.intro}</p>
        </div>

        <div style={{ marginTop: SITE_CONFIG.sectionGap, marginBottom: SITE_CONFIG.sectionGap }}>
          <HatchDivider tuning={SITE_CONFIG.hatch} />
        </div>

        <div className="mx-auto w-full max-w-[640px] px-6">
          {POSTS.length === 0 ? (
            <p className="text-bone/40 tracking-body text-body">{BLOG_META.empty}</p>
          ) : (
            <ul className="flex flex-col">
              {POSTS.map((post, index) => (
                <li key={post.slug}>
                  <article className="border-smoke-soft flex flex-col gap-2 border-b py-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-bone/30 tracking-label text-micro tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-bone tracking-heading text-lead flex-1 normal-case">
                        {post.title}
                      </h2>
                      <span className="text-bone/35 tracking-label text-micro shrink-0 tabular-nums">
                        {post.readingMinutes} min
                      </span>
                    </div>

                    <p className="text-bone/60 tracking-body text-body pl-10">{post.summary}</p>

                    <div className="flex flex-wrap items-center gap-3 pl-10">
                      <time
                        dateTime={post.date}
                        className="text-bone/35 tracking-label text-micro uppercase"
                      >
                        {DATE_FORMAT.format(new Date(post.date))}
                      </time>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border-smoke text-bone/45 tracking-label text-micro rounded-[4px] border px-2 py-[2px] uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/"
            className="text-bone/50 hover:text-acid tracking-label text-micro focus-ring mt-12 inline-block rounded-[4px] uppercase transition-colors"
          >
            ← Back to index
          </Link>
        </div>
      </main>
    </div>
  );
}
