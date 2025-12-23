import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Skull, Volume2, VolumeX, Pause, SkipForward } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";

interface StoryCardProps {
  title: string;
  content: string;
  theme: string;
  createdAt?: string;
  animate?: boolean;
}

const StoryCard = ({ title, content, theme, createdAt, animate = false }: StoryCardProps) => {
  const characterCount = content.length;
  const estimatedMinutes = Math.ceil(characterCount / 750);

  const { displayedText, isTyping, skipAnimation } = useTypingAnimation({
    text: content,
    speed: 80,
    enabled: animate,
  });

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

  const handleToggleNarration = () => {
    const fullText = `${title}. ${content}`;
    toggle(fullText);
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
            {displayedText}
            {isTyping && <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse" />}
          </p>
          {isTyping && (
            <Button
              variant="ghost"
              size="sm"
              onClick={skipAnimation}
              className="mt-2 h-7 px-2 text-xs font-mono text-muted-foreground"
            >
              <SkipForward className="w-3 h-3 mr-1" />
              Skip
            </Button>
          )}
        </div>

        {/* Audio Controls */}
        {isSupported && (
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Narration</p>

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
          </div>
        )}

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
