import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenAI TTS voices
const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

// Get a random API key from the pool
function getRandomApiKey(): string {
  const keys = [
    Deno.env.get('OPENAI_API_KEY_1'),
    Deno.env.get('OPENAI_API_KEY_2'),
    Deno.env.get('OPENAI_API_KEY_3'),
    Deno.env.get('OPENAI_API_KEY_4'),
    Deno.env.get('OPENAI_API_KEY_5'),
    Deno.env.get('OPENAI_API_KEY'), // fallback to original
  ].filter(Boolean) as string[];
  
  if (keys.length === 0) {
    throw new Error('No OpenAI API keys configured');
  }
  
  return keys[Math.floor(Math.random() * keys.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = "onyx" } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    const selectedVoice = VALID_VOICES.includes(voice) ? voice : "onyx";

    console.log(`Generating audio with voice: ${selectedVoice}, text length: ${text.length}`);

    const openaiApiKey = getRandomApiKey();
    console.log('Using API key pool for audio generation');

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS API error:", errorText);
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    console.log("Audio generated successfully, size:", audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ audio: base64Audio, format: "mp3" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating audio:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
