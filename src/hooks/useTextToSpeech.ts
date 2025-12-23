import { useState, useEffect, useCallback, useRef } from "react";

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: VoiceOption[];
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: (text: string) => void;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>("");

  useEffect(() => {
    const supported = "speechSynthesis" in window;
    setIsSupported(supported);

    if (supported) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const englishVoices = availableVoices
          .filter((voice) => voice.lang.startsWith("en"))
          .map((voice) => ({
            id: voice.voiceURI,
            name: voice.name,
            lang: voice.lang,
          }));
        
        setVoices(englishVoices);
        
        // Set default voice
        if (englishVoices.length > 0 && !selectedVoice) {
          const defaultVoice = englishVoices.find(
            (v) => v.name.toLowerCase().includes("male")
          ) || englishVoices[0];
          setSelectedVoice(defaultVoice.id);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    currentTextRef.current = text;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice]);

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isPlaying]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const toggle = useCallback((text: string) => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  }, [isPlaying, isPaused, pause, resume, speak]);

  return {
    isPlaying,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    stop,
    toggle,
  };
};
