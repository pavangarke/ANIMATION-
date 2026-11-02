import { GoogleGenAI } from '@google/genai';
import { ART_STYLES } from '../src/data/presets';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiClient();
}

/**
 * Enhances a user's creative prompt using Gemini 3.8 Flash.
 * Preserves the user's intent while enriching lighting, composition, camera direction, and style fidelity.
 */
export async function enhancePromptWithGemini(
  prompt: string,
  styleId: string,
  outputType: string = 'video'
): Promise<{ enhancedPrompt: string; styleNotes: string; model: string }> {
  const ai = getGeminiClient();
  const style = ART_STYLES.find((s) => s.id === styleId) || ART_STYLES[0];

  if (!ai) {
    // High-quality local enhancement when Gemini key is in demo mode
    const styleKeywords = style.promptModifier;
    const cinematicCamera =
      outputType === 'video'
        ? 'cinematic sweeping camera pan, 24fps motion blur, depth parallax'
        : 'sharp focal depth, Rule of Thirds composition, rich textures';

    const fallbackEnhanced = `${prompt.trim()}, depicted in breathtaking ${style.name} visual style. Featuring ${styleKeywords}, ${cinematicCamera}, volumetric atmospheric lighting, intricate environmental micro-details, expressive color grade, pristine visual balance.`;

    return {
      enhancedPrompt: fallbackEnhanced,
      styleNotes: `Enhanced using ${style.name} design profile (Demo Mode - Configure GEMINI_API_KEY for live Flash AI).`,
      model: 'demo-director-v1',
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          text: `You are an elite creative director and prompt engineer for high-end AI animation, cinema, and digital art studios.
The user wants to generate a ${outputType} in the "${style.name}" style (${style.description}).

Original User Prompt:
"${prompt}"

Style Prompt Modifier to incorporate seamlessly:
"${style.promptModifier}"

Instructions:
1. Preserve the user's exact creative vision, characters, and actions.
2. Enrich the scene with cinematic camera movement (e.g. tracking shot, orbital pan, slow-motion push-in), volumetric lighting (e.g. rim light, god rays, atmospheric fog), environmental depth, and material textures.
3. Keep the output focused on pure visual description suitable for image and animation synthesis (avoid conversational preamble or quotes).
4. Output should be 2 to 4 vivid, cohesive sentences.`,
        },
      ],
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const enhanced = response.text?.trim() || prompt;
    return {
      enhancedPrompt: enhanced,
      styleNotes: `Enhanced with Gemini 3.8 Flash for ${style.name} production.`,
      model: 'gemini-3.8-flash',
    };
  } catch (error: any) {
    console.error('Gemini prompt enhancement error:', error?.message || error);
    // Graceful fallback to rich template if model temporarily fails
    const fallbackEnhanced = `${prompt.trim()}, ${style.promptModifier}, cinematic lighting, 8k resolution, atmospheric composition.`;
    return {
      enhancedPrompt: fallbackEnhanced,
      styleNotes: `Fallback style enhancement (${error?.message || 'Gemini error'}).`,
      model: 'gemini-fallback',
    };
  }
}

/**
 * Generates creative prompt ideas across different art styles.
 */
export async function generateIdeaWithGemini(
  styleId?: string
): Promise<{ title: string; prompt: string; styleId: string; model: string }> {
  const ai = getGeminiClient();
  const selectedStyle = styleId
    ? ART_STYLES.find((s) => s.id === styleId) || ART_STYLES[0]
    : ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

  if (!ai) {
    const defaultIdeas = [
      {
        title: 'Chrono-Clockwork Citadel',
        prompt: 'A floating steampunk citadel driven by giant brass clockwork gears above a sea of iridescent clouds, warm golden hour sunbeams, miniature airships docking at wooden piers, cinematic wide-angle shot.',
        styleId: '3d_cinematic',
      },
      {
        title: 'Cyberpunk Rain Alleyway',
        prompt: 'A neon-lit noodle bar tucked in a rainy alley of Neo-Tokyo, holographic signs reflecting in dark puddles, steam rising from ceramic bowls, cozy yet high-tech atmospheric depth.',
        styleId: 'cyberpunk',
      },
      {
        title: 'Starlight Shrine Maiden',
        prompt: 'An anime shrine surrounded by ancient torii gates in a field of glowing silver grass under a spiraling aurora borealis, soft wind carrying autumn leaves, hand-drawn Ghibli style.',
        styleId: '2d_anime',
      },
      {
        title: 'Miniature Woolen Explorer',
        prompt: 'A miniature felt explorer with needle-threaded rope climbing a giant mossy garden peach, handcrafted stop-motion textures, soft tilt-shift focus, studio warm lamp lighting.',
        styleId: 'stop_motion',
      },
    ];
    const picked = defaultIdeas[Math.floor(Math.random() * defaultIdeas.length)];
    return { ...picked, model: 'demo-preset' };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide 1 captivating, imaginative animation scene idea in the "${selectedStyle.name}" style.
Format your answer as valid JSON with "title" (short 2-4 words) and "prompt" (detailed descriptive prompt, 35-50 words). Return ONLY the JSON object.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return {
      title: parsed.title || 'Magical Journey',
      prompt: parsed.prompt || 'A mesmerizing cinematic scene with magical lighting and vivid atmospheric effects.',
      styleId: selectedStyle.id,
      model: 'gemini-3.8-flash',
    };
  } catch (err) {
    return {
      title: 'Celestial Odyssey',
      prompt: 'A deep space explorer standing on a crystalline comet trailing luminous stardust across a purple nebula, cinematic wide camera tracking.',
      styleId: selectedStyle.id,
      model: 'fallback',
    };
  }
}

/**
 * Text-to-Speech using Gemini 3.8 Flash Lite TTS.
 * Supported prebuilt voice names: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'.
 * Returns base64 encoded audio/wav.
 */
export async function generateSpeechWithGemini(
  text: string,
  voicePersona: 'Zephyr' | 'Puck' | 'Kore' = 'Zephyr'
): Promise<{ audioBase64: string; mimeType: string; isDemo: boolean; durationEstimate: number }> {
  const ai = getGeminiClient();

  // Valid voice names for Gemini TTS
  const voiceName = voicePersona === 'Zephyr' ? 'Zephyr' : voicePersona === 'Puck' ? 'Puck' : 'Kore';

  if (!ai) {
    return {
      audioBase64: '',
      mimeType: 'audio/wav',
      isDemo: true,
      durationEstimate: Math.max(3, Math.ceil(text.split(' ').length / 2.5)),
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style:
                  voiceName === 'Zephyr'
                    ? 'Deep, cinematic, resonant narrator'
                    : voiceName === 'Puck'
                    ? 'Energetic, playful, dynamic speaker'
                    : 'Warm, articulate, elegant storyteller',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS.');
    }

    return {
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      isDemo: false,
      durationEstimate: Math.max(2, Math.ceil(text.split(' ').length / 2.5)),
    };
  } catch (error: any) {
    console.error('Gemini TTS error:', error?.message || error);
    return {
      audioBase64: '',
      mimeType: 'audio/wav',
      isDemo: true,
      durationEstimate: Math.max(3, Math.ceil(text.split(' ').length / 2.5)),
    };
  }
}

/**
 * Image generation using Gemini image model when configured.
 */
export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: '16:9' | '9:16' | '1:1' = '16:9'
): Promise<{ imageUrl: string; isDemo: boolean; model: string }> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      imageUrl: '',
      isDemo: true,
      model: 'demo-canvas-renderer',
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let foundImageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        foundImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (foundImageUrl) {
      return {
        imageUrl: foundImageUrl,
        isDemo: false,
        model: 'gemini-3.1-flash-lite-image',
      };
    }

    return {
      imageUrl: '',
      isDemo: true,
      model: 'gemini-text-only-fallback',
    };
  } catch (error: any) {
    console.warn('Gemini image generation unavailable or requires paid tier:', error?.message || error);
    return {
      imageUrl: '',
      isDemo: true,
      model: 'demo-canvas-engine',
    };
  }
}

/**
 * Video Generation using Gemini Omni 1.1 Flash via Interactions API.
 * ai.interactions.create with model: 'gemini-omni-1.1-flash'
 */
export async function generateVideoWithOmniFlash(
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9',
  durationSeconds: number = 5
): Promise<{ videoUrl: string; isLiveAI: boolean; model: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    return { videoUrl: '', isLiveAI: false, model: 'unconfigured' };
  }

  try {
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: prompt,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
          duration: durationSeconds >= 8 ? '10s' : '5s',
          resolution: '720p',
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      return {
        videoUrl: `data:${mime};base64,${videoPart.data}`,
        isLiveAI: true,
        model: 'gemini-omni-1.1-flash',
      };
    }

    return { videoUrl: '', isLiveAI: false, model: 'gemini-omni-no-data' };
  } catch (error: any) {
    console.warn('Gemini Omni 1.1 Flash video generation note:', error?.message || error);
    return { videoUrl: '', isLiveAI: false, model: 'gemini-omni-unavailable' };
  }
}
