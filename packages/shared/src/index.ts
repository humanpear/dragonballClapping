import { z } from 'zod';

export const playerActionSchema = z.enum(['ATTACK', 'BLOCK', 'CHARGE']);
export type PlayerAction = z.infer<typeof playerActionSchema>;

export const submitInputSchema = z.object({
  matchId: z.string(),
  turnIndex: z.number().int().nonnegative(),
  beat: z.number().int().min(1).max(2),
  action: playerActionSchema
});
export type SubmitInputDto = z.infer<typeof submitInputSchema>;

export const turnWindowSchema = z.object({
  turnIndex: z.number().int().nonnegative(),
  turnStartTs: z.number(),
  inputCloseTs: z.number(),
  lockInTs: z.number(),
  beatDurationMs: z.number()
});
export type TurnWindow = z.infer<typeof turnWindowSchema>;

export const resolvedEventSchema = z.object({
  turnIndex: z.number(),
  vfxKey: z.string(),
  sfxKey: z.string(),
  delta: z.object({ p1: z.number(), p2: z.number() }),
  kiAfter: z.object({ p1: z.number(), p2: z.number() }),
  hpAfter: z.object({ p1: z.number(), p2: z.number() }),
  summary: z.string()
});
export type ResolvedEvent = z.infer<typeof resolvedEventSchema>;

export type AuthProvider = 'google' | 'kakao';
export type AuthMode = 'mock' | 'oauth';
