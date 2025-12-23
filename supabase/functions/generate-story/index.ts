import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const themes = [
  "wrong number call", "voicemail I don't remember leaving", "email from myself", "text from unknown number",
  "something in the house", "apartment noise", "basement discovery", "attic find", "new house", "roommate acting off",
  "late night drive", "gas station encounter", "motel stay", "wrong exit", "empty rest stop", "hitchhiker",
  "neighbor acting strange", "someone following me", "coworker I don't remember", "person who looks like me",
  "work alone at night", "security camera footage", "office after hours", "night shift",
  "childhood memory", "old photograph", "home video", "diary entry I don't remember writing",
  "hiking alone", "empty parking lot", "elevator ride", "hospital visit", "library at closing",
  "item I don't own", "gift with no sender", "locked box", "old recording",
  "power outage", "lost time", "déjà vu", "same day repeating",
  "smart home glitch", "baby monitor static", "Ring doorbell footage", "GPS taking wrong route",
  "wrong address", "Airbnb stay", "moving day", "house sitting", "dog barking at nothing",
  "notice the same stranger in different places", "someone keeps calling but never speaks",
  "delivery driver asks too many personal questions", "neighbor keeps watching from their window",
  "find a hidden camera in my apartment", "ride-share driver takes the long way without asking",
  "unmarked car idling outside every night", "coworker starts showing up near my home",
  "find photos of myself online that I never took", "door unlocked when I’m sure I locked it",
  "voice message from unknown number saying my name", "acquaintance knows too much about my schedule",
  "package arrives with no return address", "find GPS tracker under my car",
  "mail keeps arriving for someone who doesn’t live here", "someone pretending to be from maintenance",
  "neighbor insists they saw me somewhere I’ve never been", "see flashes from a nearby building window",
  "my keys go missing then reappear", "someone knocks but leaves before I answer",
  "text says 'look outside'", "find footprints near my back door", "hear a phone vibrating under the floorboards",
  "every new neighbor looks familiar", "children mention a man watching the building",
  "security footage deleted overnight", "police say there’s no record of my complaint",
  "neighbor asking strange personal questions", "footsteps upstairs in an empty house",
  "find items slightly moved daily", "maintenance worker keeps showing up unannounced",
  "smell of cigarette smoke though no one smokes", "hear muffled arguments through the vents",
  "doorbell rings at the same time every night", "notes slipped under the door",
  "apartment next door never turns on any lights", "new tenant moves in but never leaves their unit",
  "someone keeps parking in my spot and disappearing", "neighbor leaves garbage bags outside that smell strange",
  "apartment intercom keeps buzzing but no one answers", "hearing my name whispered through thin walls",
  "think I hear breathing through ductwork", "find unfamiliar keys on my counter",
  "landlord avoids questions about previous tenant", "someone keeps knocking at 3AM",
  "neighbor offers help that's too intrusive", "mailbox contains photos of my front door",
  "find a personal belonging in a place I didn’t leave it", "someone tried my doorknob while I was inside",
  "muffled TV sound from an apartment listed as vacant", "neighbor’s blinds never open but lights flicker inside",
  "garbage bag left at my door", "scraping sound behind the walls",
  "someone whistles outside every night at the same time", "person across the street keeps their lights aimed at my window",
  "get text updates from a delivery I never ordered", "my phone location shows places I’ve never visited",
  "someone insists we’ve met before but I don’t remember them", "find strange handwriting on my grocery list",
  "housewarming gift arrives from no one I know", "neighbor knocks and claims to be checking the pipes",
  "my name is written on a piece of mail not addressed to me", "voice on intercom says 'I know you're home'",
  "notice traffic cameras pointing directly at my building", "window open when I keep it locked"
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

function getRandomApiKey(): string {
  const keys = [
    Deno.env.get('OPENAI_API_KEY_1'),
    Deno.env.get('OPENAI_API_KEY_2'),
    Deno.env.get('OPENAI_API_KEY_3'),
    Deno.env.get('OPENAI_API_KEY_4'),
    Deno.env.get('OPENAI_API_KEY_5'),
    Deno.env.get('OPENAI_API_KEY'),
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

    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    const storyCount = count || 0;

    const randomTheme = themes[(storyCount + Math.floor(Math.random() * themes.length)) % themes.length];
    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const systemPrompt = `You write short, unsettling stories that feel like real accounts from ordinary people.

Create a brief, creepy story (600-900 characters) that:
- First-person, like someone telling a friend what happened
- Mundane setting: home, work, commute, store
- NO supernatural creatures, demons, ghosts, or fantasy
- The horror is subtle - unexplained events, things that don't add up
- Conversational tone, simple words
- Theme hint: "${randomTheme}"
- Each sentence on its own line, blank line between sentences

BAD (too dramatic): "Terror seized my heart as the shadow creature materialized"
GOOD (realistic): "I found my front door unlocked. I always lock it."

BAD: "The demon's eyes glowed with hellfire"
GOOD: "The man waved at me. I don't know any men who look like that."

Keep it short. Leave things unexplained. Sound like a real person.

Seed: ${uniqueSeed}`;

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
          { role: 'user', content: `Write a short creepy story about: ${randomTheme}. Keep it under 900 characters. Sound real, not fictional.` }
        ],
        max_tokens: 400,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const storyContent = data.choices[0].message.content;

    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Generate a simple, understated title (2-4 words) for this story. No dramatic words like "terror", "horror", "nightmare". Just plain, slightly unsettling. Examples: "The Voicemail", "Wrong Floor", "Tuesday Night". Just the title.' },
          { role: 'user', content: storyContent }
        ],
        max_tokens: 15,
        temperature: 0.7,
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content.replace(/"/g, '').trim();

    const contentHash = hashString(storyContent.toLowerCase().replace(/\s+/g, ''));

    const { data: existingStory } = await supabase
      .from('stories')
      .select('id')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existingStory) {

      console.log('Duplicate detected, story generation succeeded but matched existing');
    }

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
