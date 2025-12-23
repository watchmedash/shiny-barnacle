import { useState, useEffect, useRef } from "react";

interface UseTypingAnimationProps {
  text: string;
  speed?: number; // characters per second
  enabled?: boolean;
}

export const useTypingAnimation = ({
  text,
  speed = 50,
  enabled = true,
}: UseTypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isTyping, setIsTyping] = useState(enabled);
  const previousTextRef = useRef<string>("");

  useEffect(() => {
    // If text changed (new story generated), reset and start typing
    if (text !== previousTextRef.current) {
      previousTextRef.current = text;
      
      if (enabled) {
        setDisplayedText("");
        setIsTyping(true);
      } else {
        setDisplayedText(text);
        setIsTyping(false);
      }
    }
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled || !isTyping) return;

    if (displayedText.length >= text.length) {
      setIsTyping(false);
      return;
    }

    const interval = 1000 / speed;
    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, interval);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed, enabled, isTyping]);

  const skipAnimation = () => {
    setDisplayedText(text);
    setIsTyping(false);
  };

  return { displayedText, isTyping, skipAnimation };
};
