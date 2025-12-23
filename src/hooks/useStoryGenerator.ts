import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  created_at: string;
}

export const useStoryGenerator = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateStory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-story");

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStory(data);
      toast({
        title: "Nightmare Unleashed",
        description: `"${data.title}" has emerged from the darkness.`,
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "The darkness retreats...",
        description: error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    story,
    isLoading,
    generateStory,
  };
};
