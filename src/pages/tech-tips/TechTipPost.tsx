import { useParams, Link, Navigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import techTips from "@/data/tech-tips.json";
import { CalendarDays, ChevronRight, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function TechTipPost() {
  const { slug } = useParams<{ slug: string }>();

  const post = techTips.find((t) => t.slug === slug);
  const postIndex = techTips.findIndex((t) => t.slug === slug);

  // Get adjacent posts for navigation
  const prevPost = postIndex > 0 ? techTips[postIndex - 1] : null;
  const nextPost = postIndex < techTips.length - 1 ? techTips[postIndex + 1] : null;

  if (!post) {
    return <Navigate to="/tech-tips" replace />;
  }

  return (
    <SiteLayout>
      <SEO
        title={`${post.title} - Tech Tips`}
        description={post.excerpt}
        canonical={`https://anythingitechmv.com/tech-tips/${post.slug}`}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-editorial py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/tech-tips" className="hover:text-foreground transition-colors">
              Tech Tips
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[300px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Louis Hall
            </span>
          </div>

          <h1 className="display-lg text-balance mb-6 animate-fade-up">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up-delay-1">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 md:py-16">
        <div className="container-editorial max-w-3xl mx-auto">
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="font-display text-2xl mt-8 mb-4">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-2xl mt-8 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-xl mt-6 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-2 list-disc pl-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 space-y-2 list-decimal pl-6">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/90">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                hr: () => <hr className="my-8 border-border" />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Navigation */}
      <section className="py-12 border-t border-border bg-surface">
        <div className="container-editorial max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevPost ? (
              <Link
                to={`/tech-tips/${prevPost.slug}`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="line-clamp-1">{prevPost.title}</span>
              </Link>
            ) : (
              <div />
            )}

            <Button asChild variant="outline" className="rounded-full">
              <Link to="/tech-tips">
                All Tech Tips
              </Link>
            </Button>

            {nextPost ? (
              <Link
                to={`/tech-tips/${nextPost.slug}`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="line-clamp-1">{nextPost.title}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
