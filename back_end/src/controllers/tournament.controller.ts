import { FastifyRequest, FastifyReply } from 'fastify';
import * as tournamentService from '../services/tournament.service';
import { NewTournamentPayload } from '../types/tournament-type';
import userService from '../services/user';
import { notifyMatchPlayers, resolvePlayersToUsers } from '../services/tournamentNotification.service';
import { ChatService } from '../chat/chatService';

import { getIO } from '../socket';

export const createTournamentHandler = async (
  request: FastifyRequest<{ Body: NewTournamentPayload }>,
  reply: FastifyReply
) => {
  console.log('createTournamentHandler called with body:', JSON.stringify(request.body));
  try {
    const userId = request.user?.id;
    let creatorName = "Host";

    if (userId) {
      const user = await userService.getUserById(userId);
      if (user) creatorName = user.username;
    }
    const tournamentPayload = {
      ...request.body,
      hostUsername: creatorName
    };

    const tournament = await tournamentService.createTournament(tournamentPayload);

    try {
      const playerAliases = request.body.players;
      console.log('Tournament created. Checking aliases:', playerAliases);

      if (playerAliases.length > 0) {
        const resolvedPlayers = await resolvePlayersToUsers(playerAliases);

        const linkedPlayers = resolvedPlayers.filter(p =>
          p.userId !== null && p.username !== creatorName
        );


        if (linkedPlayers.length > 0) {
          for (const player of linkedPlayers) {
            if (player.userId && player.username) {
              const chatNamespace = getIO().of('/chat');
              const personalRoom = `user_${player.username.toLowerCase()}`;

              console.log(`📢 Sending notification to room: ${personalRoom}`);
              chatNamespace.to(personalRoom).emit('receive_message', {
                text: `You are in a local tournament hosted by ${creatorName}. Please head to their computer when it's your turn!`,
                sender: 'System',
                type: 'system',
                id: Date.now()
              });
              chatNamespace.to(personalRoom).emit('tournament_invite', {
                message: `You are in ${creatorName}'s tournament! Go to their PC to play.`,
                hostName: creatorName,
                tournamentId: tournament.tournament_id
              });
              const notificationText = `You are in a local tournament hosted by ${creatorName}. Please head to their computer when it's your turn!`;
              try {
                const saveResult = await ChatService.saveMessage(creatorName, player.username, notificationText, 'system');
                if (saveResult && typeof saveResult === 'object' && 'in' in saveResult) {
                } 
              } catch (saveErr) {
              }
            }
          }
        }
      }
    } catch (e) {
    }

    reply.code(201).send(tournament);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const updateTournamentHandler = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { winner: string } }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const { winner } = request.body;

    if (!winner) {
      return reply.code(400).send({ message: 'Winner name is required' });
    }

    const updated = await tournamentService.updateTournament(id, winner);
    reply.code(200).send(updated);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getTournamentHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const tournament = await tournamentService.getTournamentById(id);
    if (!tournament) {
      return reply.code(404).send({ message: 'Tournament not found' });
    }
    reply.code(200).send(tournament);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const notifyNextMatchHandler = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { nextPlayerAliases: string[]; hostUsername?: string }
  }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const { nextPlayerAliases, hostUsername } = request.body;

    if (!nextPlayerAliases || nextPlayerAliases.length === 0) {
      return reply.code(400).send({ message: 'nextPlayerAliases is required' });
    }
    const players = await tournamentService.getTournamentPlayers(id);
    if (!players || players.length === 0) {
      return reply.code(404).send({ message: 'Tournament not found or no players' });
    }
    const matchPlayers = players.filter((p: any) =>
      nextPlayerAliases.some((alias: string) =>
        alias.toLowerCase() === p.alias.toLowerCase()
      )
    );
    const host = hostUsername || 'Host';
    await notifyMatchPlayers(matchPlayers, host);

    reply.code(200).send({
      message: 'Notifications sent',
      notifiedPlayers: matchPlayers.filter((p: any) => p.userId).map((p: any) => p.alias)
    });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};