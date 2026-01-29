
export { validate, validateQuery, validateParams, safeParse } from './middleware';

// Authentication schemas
export {
    SignInSchema,
    SignUpSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    Verify2FASchema,
    GoogleAuthSchema,
    IntraAuthSchema,
    ChangePasswordSchema,
    UpdateAccountSchema
} from './schemas/auth.schemas';

// 2FA schemas
export {
    Setup2FASchema,
    Enable2FASchema,
    Disable2FASchema
} from './schemas/twofa.schemas';

// Friend schemas
export {
    FriendRequestSchema,
    AcceptFriendSchema,
    RejectFriendSchema,
    RemoveFriendSchema,
    GetFriendStatusQuerySchema,
    FriendsUserIdParamSchema
} from './schemas/friend.schemas';

// Tournament schemas
export {
    CreateTournamentSchema,
    UpdateTournamentSchema,
    TournamentIdParamSchema
} from './schemas/tournament.schemas';

// Avatar schemas
export {
    SetAvatarSchema,
    DeleteAvatarSchema
} from './schemas/avatar.schemas';

// User schemas
export {
    SearchUserQuerySchema,
    UserIdParamSchema
} from './schemas/user.schemas';

// Stats schemas
export {
    GetStatsQuerySchema
} from './schemas/stats.schemas';
