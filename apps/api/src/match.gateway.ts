import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { createCpuPolicyAction, createTurnWindow, resolveTurn, type FighterState, gameConfig } from '@dragonball/game-core';
import { submitInputSchema, type PlayerAction } from '@dragonball/shared';
import { PrismaService } from './prisma.service';

type MatchState = {
  matchId: string;
  turnIndex: number;
  p1: FighterState;
  p2: FighterState;
  p1Input?: { beat1?: PlayerAction; beat2?: PlayerAction };
  p2Input?: { beat1?: PlayerAction; beat2?: PlayerAction };
  window: ReturnType<typeof createTurnWindow>;
  status: 'running' | 'ended';
};

@WebSocketGateway({ cors: { origin: '*' } })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MatchGateway.name);
  private readonly matches = new Map<string, MatchState>();

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  @SubscribeMessage('match:start-vs-cpu')
  async handleStart(@ConnectedSocket() client: Socket) {
    const matchId = `match-${client.id}-${Date.now()}`;
    client.join(matchId);
    const state: MatchState = {
      matchId,
      turnIndex: 0,
      p1: { hp: 100, ki: 0 },
      p2: { hp: 100, ki: 0 },
      window: createTurnWindow(0, Date.now()),
      status: 'running'
    };
    this.matches.set(matchId, state);
    this.server.to(matchId).emit('match:started', { matchId, gameConfig });
    await this.emitTurn(matchId);
  }

  @SubscribeMessage('match:submit-input')
  async handleSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown) {
    const parsed = submitInputSchema.safeParse(payload);
    if (!parsed.success) {
      client.emit('match:error', { message: 'invalid payload' });
      return;
    }
    const { matchId, beat, action, turnIndex } = parsed.data;
    const state = this.matches.get(matchId);
    if (!state || state.status === 'ended') return;
    if (turnIndex !== state.turnIndex) {
      client.emit('match:error', { message: 'turn mismatch' });
      return;
    }
    if (Date.now() > state.window.inputCloseTs) {
      client.emit('match:error', { message: 'input closed' });
      return;
    }

    state.p1Input = state.p1Input ?? {};
    if (beat === 1) state.p1Input.beat1 = action;
    if (beat === 2) state.p1Input.beat2 = action;
    this.server.to(matchId).emit('match:input-accepted', { beat, action, player: 'p1' });
    await this.prisma.safeCreateMatchEvent({ matchId, turnIndex, type: 'input', payload: { beat, action, player: 'p1' } });
  }

  private async emitTurn(matchId: string) {
    const state = this.matches.get(matchId);
    if (!state || state.status === 'ended') return;

    state.window = createTurnWindow(state.turnIndex, Date.now());
    this.server.to(matchId).emit('match:turn-window', state.window);

    setTimeout(async () => {
      const current = this.matches.get(matchId);
      if (!current || current.status === 'ended') return;
      current.p2Input = {
        beat1: createCpuPolicyAction(current.turnIndex),
        beat2: createCpuPolicyAction(current.turnIndex + 1)
      };
      current.p1Input = current.p1Input ?? {};
      const p1b1 = current.p1Input.beat1 ?? 'BLOCK';
      const p1b2 = current.p1Input.beat2 ?? 'BLOCK';

      const resolved = resolveTurn(
        current.turnIndex,
        { beat1: p1b1, beat2: p1b2 },
        { beat1: current.p2Input.beat1 ?? 'BLOCK', beat2: current.p2Input.beat2 ?? 'BLOCK' },
        current.p1,
        current.p2
      );

      current.p1 = resolved.p1After;
      current.p2 = resolved.p2After;
      this.server.to(matchId).emit('match:resolved', resolved.event);
      await this.prisma.safeCreateMatchEvent({ matchId, turnIndex: current.turnIndex, type: 'resolved', payload: resolved.event });

      if (current.p1.hp <= 0 || current.p2.hp <= 0 || current.turnIndex >= 9) {
        current.status = 'ended';
        this.server.to(matchId).emit('match:ended', {
          winner: current.p1.hp === current.p2.hp ? 'draw' : current.p1.hp > current.p2.hp ? 'player' : 'cpu',
          p1: current.p1,
          p2: current.p2
        });
        return;
      }

      current.turnIndex += 1;
      current.p1Input = {};
      current.p2Input = {};
      await this.emitTurn(matchId);
    }, state.window.lockInTs - Date.now());
  }
}
