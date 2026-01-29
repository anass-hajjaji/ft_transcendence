import { getUserByTournamentAlias } from './user.service';
import { getIO } from '../socket';

export interface TournamentPlayer {
    alias: string;
    userId: number | null;
    username: string | null;
}

export const resolvePlayersToUsers = async (aliases: string[]): Promise<TournamentPlayer[]> => {
    const resolvedPlayers: TournamentPlayer[] = [];

    for (const alias of aliases) {
        const user = await getUserByTournamentAlias(alias);

        if (user) {
            resolvedPlayers.push({
                alias: alias,
                userId: user.id_user,
                username: user.username
            });
        } else {
            resolvedPlayers.push({
                alias: alias,
                userId: null,
                username: null
            });
        }
    }

    return resolvedPlayers;
};

export const notifyPlayerForMatch = async (
    userId: number,
    hostName: string,
    username: string
): Promise<boolean> => {
    try {
        const io = getIO();
        const chatNamespace = io.of('/chat');
        const personalRoom = `user_${username}`;

    chatNamespace.to(personalRoom).emit('receive_message', {
        text: `Your match is UP! Please head to ${hostName}'s computer immediately to play.`,
        sender: 'System',
        type: 'system',
        id: Date.now()
    });

    chatNamespace.to(personalRoom).emit('tournament_match_ready', {
        message: `It's your turn! Go to ${hostName}'s computer now!`,
        hostName: hostName
    });

        console.log(`Sent tournament match notification to user: ${username}`);
        return true;
    } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        return false;
    }
};

export const notifyMatchPlayers = async (
    players: TournamentPlayer[],
    hostName: string
): Promise<void> => {
    for (const player of players) {
        if (player.userId && player.username) {
            await notifyPlayerForMatch(player.userId, hostName, player.username);
        }
    }
};
