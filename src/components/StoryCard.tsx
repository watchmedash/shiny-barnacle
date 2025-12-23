import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Skull, Volume2, VolumeX, Pause, Download, Loader2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoryCardProps {
  title: string;
  content: string;
  theme: string;
  createdAt?: string;
}

const OPENAI_VOICES = [
  { id: "alloy", name: "Alloy (Neutral)" },
  { id: "echo", name: "Echo (Male)" },
  { id: "fable", name: "Fable (British)" },
  { id: "onyx", name: "Onyx (Deep Male)" },
  { id: "nova", name: "Nova (Female)" },
  { id: "shimmer", name: "Shimmer (Soft Female)" },
];

const StoryCard = ({ title, content, theme, createdAt }: StoryCardProps) => {
  const characterCount = content.length;
  const estimatedMinutes = Math.ceil(characterCount / 750);
  const { 
    isPlaying, 
    isPaused, 
    isSupported, 
    voices, 
    selectedVoice, 
    setSelectedVoice, 
    toggle, 
    stop 
  } = useTextToSpeech();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadVoice, setDownloadVoice] = useState("onyx");

  const handleToggleNarration = () => {
    const fullText = `${title}. ${content}`;
    toggle(fullText);
  };

  const handleDownloadAudio = async () => {
    setIsDownloading(true);
    try {
      const fullText = `${title}. ${content}`;
      
      const { data, error } = await supabase.functions.invoke("generate-audio", {
        body: { text: fullText, voice: downloadVoice },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Convert base64 to blob and download
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Audio downloaded successfully!");
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="border-2 border-border bg-card shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="outline" className="border-primary text-primary uppercase tracking-wider font-mono text-xs">
            <Skull className="w-3 h-3 mr-1" />
            {theme}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-xs font-mono">
            <Clock className="w-3 h-3" />
            ~{estimatedMinutes} min read
          </div>
        </div>
        <CardTitle className="font-serif text-2xl md:text-3xl tracking-tight leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-invert max-w-none">
          <p className="font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
            {content}
          </p>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Narration Controls</p>
          
          {/* Live Playback Controls */}
          {isSupported && (
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-[180px] border font-mono text-xs h-8">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="font-mono text-xs">
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleNarration}
                className="h-8 px-3 font-mono uppercase text-xs border-2"
              >
                {isPlaying && !isPaused ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : isPaused ? (
                  <>
                    <Volume2 className="w-3 h-3 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 mr-1" />
                    Listen
                  </>
                )}
              </Button>
              
              {(isPlaying || isPaused) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stop}
                  className="h-8 px-2"
                >
                  <VolumeX className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Download Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={downloadVoice} onValueChange={setDownloadVoice}>
              <SelectTrigger className="w-[180px] border font-mono text-xs h-8">
                <SelectValue placeholder="Download voice" />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id} className="font-mono text-xs">
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="h-8 px-3 font-mono uppercase text-xs border-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  Download MP3
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{characterCount} characters</span>
          {createdAt && (
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCard;
