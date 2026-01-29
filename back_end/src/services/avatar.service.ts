
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';
import { dbRun, dbGet } from '../db/db-utils';



const UPLOAD_DIR = path.join(process.cwd(), 'uploads/avatars');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}


export const DEFAULT_AVATARS = [
  { id: 'avatar1', url: '/uploads/avatars/defaults/avatar1.jpg', name: 'Warrior' },
  { id: 'avatar2', url: '/uploads/avatars/defaults/avatar2.jpg', name: 'Mage' },
  { id: 'avatar3', url: '/uploads/avatars/defaults/avatar3.jpg', name: 'Ninja' },
  { id: 'avatar4', url: '/uploads/avatars/defaults/avatar4.jpg', name: 'Robot' },
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const avatarService = {
	uploadAvatar: async (userId: number, file: any) => {
		if (!ALLOWED_TYPES.includes(file.mimetype)) {
		  throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WEBP');
		}
	
		if (file.file.bytesRead > MAX_FILE_SIZE) {
		  throw new Error('File too large');
		}
	
		const user = await dbGet('SELECT avatar FROM users WHERE id_user = ?', [userId]);
		const oldAvatar = user?.avatar;
	
		const ext = path.extname(file.filename) || `.${file.mimetype.split('/')[1]}`;
		const filename = `${userId}-${randomUUID()}${ext}`;
		const filepath = path.join(UPLOAD_DIR, filename);
	
		await pipeline(file.file, fs.createWriteStream(filepath));
		const avatarUrl = `/uploads/avatars/${filename}`;
	
		await dbRun('UPDATE users SET avatar = ? WHERE id_user = ?', [avatarUrl, userId]);
	
		if (oldAvatar && oldAvatar.startsWith('/uploads/avatars/') && !oldAvatar.includes('/defaults/')) {
		  const oldPath = path.join(UPLOAD_DIR, path.basename(oldAvatar));
		  if (fs.existsSync(oldPath)) {
			fs.unlink(oldPath, () => {});
		  }
		}
	
		return { success: true, avatar: avatarUrl, filename };
	  },

	  setAvatar: async (userId: number, avatarUrl: string) => {
		const isDefault = DEFAULT_AVATARS.some(defaultAv => defaultAv.url === avatarUrl);
		if (!isDefault) {
		  const filename = path.basename(avatarUrl);
		  if (!filename.startsWith(`${userId}-`)) {
			throw new Error('Invalid avatar selection or unauthorized');
		  }
		  
		  const filepath = path.join(UPLOAD_DIR, filename);
		  if (!fs.existsSync(filepath)) {
			throw new Error('Avatar file does not exist');
		  }
		}
		await dbRun('UPDATE users SET avatar = ? WHERE id_user = ?', [avatarUrl, userId]);
	
		return {
		  success: true,
		  avatar: avatarUrl,
		};
  },

  deleteAvatar: async (userId: number, avatarUrl: string) => {
    if (avatarUrl.includes('/defaults/')) {
      throw new Error('Cannot delete default avatars');
    }

    const filename = path.basename(avatarUrl);
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!filename.startsWith(`${userId}-`)) {
      throw new Error('You can only delete your own avatars');
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    const user = await dbGet('SELECT avatar FROM users WHERE id_user = ?', [userId]);
    if (user && user.avatar === avatarUrl) {
      await dbRun('UPDATE users SET avatar = ? WHERE id_user = ?', [null, userId]);
    }

    return {
      success: true,
      message: 'Avatar deleted successfully',
    };
  },
  getUserAvatars: async (userId: number) => {
    const customAvatars: { id: string; url: string; name: string }[] = [];

    if (fs.existsSync(UPLOAD_DIR)) {
      const files = fs.readdirSync(UPLOAD_DIR);
      files.forEach((file) => {
        if (file.startsWith(`${userId}-`)) {
          customAvatars.push({
            id: file,
            url: `/uploads/avatars/${file}`,
            name: 'Custom',
          });
        }
      });
    }

    return {
      defaults: DEFAULT_AVATARS,
      custom: customAvatars,
    };
  },

  getCurrentAvatar: async (userId: number) => {
    const user = await dbGet('SELECT avatar FROM users WHERE id_user = ?', [userId]);
    return user?.avatar || '';
  },
};

export default avatarService;