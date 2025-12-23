import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Ghost, ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StoryCard from "@/components/StoryCard";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  created_at: string;
}

const STORIES_PER_PAGE = 5;

const THEMES = [
  "all",
  "haunted house",
  "paranormal encounter",
  "psychological horror",
  "supernatural creature",
  "cursed object",
  "abandoned asylum",
  "demonic possession",
  "urban legend",
  "mysterious stranger",
  "nightmare realm",
  "forest horror",
  "mirror dimension",
  "time loop terror",
  "doppelganger",
  "vengeful spirit",
];

const Archive = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    fetchStories();
  }, [selectedTheme, currentPage]);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const from = (currentPage - 1) * STORIES_PER_PAGE;
      const to = from + STORIES_PER_PAGE - 1;

      let query = supabase
        .from("stories")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (selectedTheme !== "all") {
        query = query.eq("theme", selectedTheme);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setStories(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / STORIES_PER_PAGE);

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Story Archive | Nightmare Tales</title>
        <meta
          name="description"
          content="Browse our collection of AI-generated horror stories. Filter by theme and discover chilling tales from the darkness."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Atmospheric background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background pointer-events-none" />

        <main className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <header className="mb-12">
            <Link to="/">
              <Button variant="ghost" className="mb-6 font-mono uppercase tracking-wider text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generator
              </Button>
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <Ghost className="w-8 h-8 text-primary" />
              <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
                Story Archive
              </h1>
            </div>
            <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
              {totalCount} tales of terror collected
            </p>
          </header>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground uppercase">Filter by theme:</span>
            </div>
            <Select value={selectedTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[220px] border-2 font-mono uppercase text-xs">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme} className="font-mono uppercase text-xs">
                    {theme === "all" ? "All Themes" : theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stories Grid */}
          <section className="space-y-8 max-w-3xl">
            {isLoading ? (
              <div className="text-center py-16 border-2 border-dashed border-border">
                <Ghost className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4 animate-pulse" />
                <p className="font-mono text-sm text-muted-foreground uppercase">
                  Summoning stories from the void...
                </p>
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-border">
                <Ghost className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-serif text-xl text-muted-foreground mb-2">
                  No stories found
                </p>
                <p className="font-mono text-sm text-muted-foreground/60">
                  {selectedTheme !== "all"
                    ? "Try selecting a different theme"
                    : "Generate your first nightmare to begin the archive"}
                </p>
              </div>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <StoryCard
                    title={story.title}
                    content={story.content}
                    theme={story.theme}
                    createdAt={story.created_at}
                  />
                </div>
              ))
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-2 font-mono uppercase text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="font-mono text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-2 font-mono uppercase text-xs"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </nav>
          )}
        </main>
      </div>
    </>
  );
};

export default Archive;
