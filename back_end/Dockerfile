FROM node:20

# 1. Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# 2. Copy config files first (to cache dependencies)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

# 3. Install dependencies (Frozen lockfile ensures reproducible builds)
RUN pnpm install --frozen-lockfile

# 4. COPY THE SOURCE CODE
# In production, we must copy files into the image; we don't use volumes.
COPY . .

# 5. Build the application
# Assumes you have a "build" script in package.json (e.g., "tsc" or "nest build")
RUN pnpm build

EXPOSE 4000

# 6. Run the compiled app
# Assumes you have a "start" script (e.g., "node dist/main.js")
CMD ["pnpm", "start"]