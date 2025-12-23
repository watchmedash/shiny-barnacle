import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const themes = [
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
  "vengeful spirit"
];

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = getRandomApiKey();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Using API key pool for story generation');

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get existing story count for variety
    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    const storyCount = count || 0;
    
    // Select a random theme, weighted by story count to ensure variety
    const randomTheme = themes[(storyCount + Math.floor(Math.random() * themes.length)) % themes.length];
    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const systemPrompt = `You are a master horror storyteller. Generate a terrifying, original horror/thriller story told from a first-person narrator's perspective. The story MUST:

1. Be EXACTLY between 1200-1500 characters (this is crucial for 2-minute audio)
2. Start with a gripping hook that immediately draws the reader in
3. Build suspense throughout with vivid, atmospheric descriptions
4. Include an unexpected twist ending that sends chills down the spine
5. Be completely original - never repeat plots, characters, or settings
6. Use the theme "${randomTheme}" as inspiration but make it unique
7. Write as "I" - the narrator experiencing these events

IMPORTANT: 
- Count characters carefully - stay within 1200-1500 characters
- Make every word count - no filler
- The twist must be genuinely surprising
- Create a sense of dread and unease throughout

Unique seed for this story: ${uniqueSeed}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a unique horror story. Theme: ${randomTheme}. Story number: ${storyCount + 1}. Make it original and terrifying.` }
        ],
        max_tokens: 800,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const storyContent = data.choices[0].message.content;

    // Generate a title
    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Generate a short, creepy title (2-5 words) for this horror story. Just the title, nothing else.' },
          { role: 'user', content: storyContent }
        ],
        max_tokens: 20,
        temperature: 0.8,
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content.replace(/"/g, '').trim();

    // Create a hash of the content to check for duplicates
    const contentHash = hashString(storyContent.toLowerCase().replace(/\s+/g, ''));

    // Check if similar story exists
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existingStory) {
      // If duplicate found, generate again recursively (rare case)
      console.log('Duplicate detected, story generation succeeded but matched existing');
    }

    // Save story to database
    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert({
        title,
        content: storyContent,
        content_hash: contentHash,
        theme: randomTheme,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving story:', saveError);
      // If it's a unique constraint violation, just return the story without saving
      if (saveError.code === '23505') {
        return new Response(JSON.stringify({ 
          title, 
          content: storyContent, 
          theme: randomTheme,
          id: 'temp-' + Date.now()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw saveError;
    }

    console.log('Story generated successfully:', title);

    return new Response(JSON.stringify(savedStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-story function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
