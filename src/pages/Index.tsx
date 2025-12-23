import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Ghost, Flame, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/StoryCard";
import GenerateButton from "@/components/GenerateButton";
import { useStoryGenerator } from "@/hooks/useStoryGenerator";

const Index = () => {
  const { story, isLoading, generateStory } = useStoryGenerator();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <Helmet>
        <title>Nightmare Tales | AI Horror Story Generator</title>
        <meta
          name="description"
          content="Generate unique 2-minute horror stories with chilling twists. AI-powered thriller narratives told from the narrator's perspective."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Atmospheric background effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background pointer-events-none" />
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />

        <main className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <header className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Ghost className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Nightmare Tales
              </h1>
              <Flame className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
            </div>
            <p className="font-mono text-muted-foreground text-sm md:text-base max-w-2xl mx-auto uppercase tracking-widest">
              AI-Generated Horror Stories • 2-Minute Tales • Unique Twists
            </p>
            <div className="mt-4">
              <Link to="/archive">
                <Button variant="outline" size="sm" className="border-2 font-mono uppercase tracking-wider text-xs">
                  <Archive className="w-4 h-4 mr-2" />
                  Browse Archive
                </Button>
              </Link>
            </div>
            <div className="mt-2 text-xs text-muted-foreground/60 font-mono">
              Every story is unique. No tale is ever told twice.
            </div>
          </header>

          {/* Generate Button */}
          <div className="flex justify-center mb-12 md:mb-16">
            <GenerateButton onClick={generateStory} isLoading={isLoading} />
          </div>

          {/* Story Display */}
          <section className="max-w-3xl mx-auto">
            {story ? (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <StoryCard
                  title={story.title}
                  content={story.content}
                  theme={story.theme}
                  createdAt={story.created_at}
                />
              </div>
            ) : (
              <div className="text-center py-16 md:py-24 border-2 border-dashed border-border bg-card/50">
                <Ghost className="w-16 h-16 md:w-20 md:h-20 mx-auto text-muted-foreground/30 mb-6" />
                <p className="font-serif text-xl md:text-2xl text-muted-foreground mb-2">
                  The void awaits...
                </p>
                <p className="font-mono text-sm text-muted-foreground/60 uppercase tracking-wider">
                  Press the button to summon a tale from the darkness
                </p>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-16 md:mt-24 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 font-mono uppercase tracking-widest">
              <span className="w-8 h-px bg-border" />
              <span>Stories generated for text-to-speech</span>
              <span className="w-8 h-px bg-border" />
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Index;
