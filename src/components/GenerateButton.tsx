import { Button } from "@/components/ui/button";
import { Skull, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const GenerateButton = ({ onClick, isLoading }: GenerateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="group relative overflow-hidden border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all font-mono uppercase tracking-wider text-sm md:text-base px-8 py-6"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Summoning Story...
        </>
      ) : (
        <>
          <Skull className="mr-2 h-5 w-5 group-hover:animate-pulse" />
          Generate Nightmare
        </>
      )}
    </Button>
  );
};

export default GenerateButton;
