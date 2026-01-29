FROM node:20

RUN npm install -g pnpm

WORKDIR /app

# 1. Copy config files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# 2. Install dependencies (Frozen lockfile for safety)
RUN pnpm install --frozen-lockfile

# 3. COPY THE SOURCE CODE
# Next.js needs the source files to compile pages/components
COPY . .

# 4. Set Environment to Production
# This tells Next.js to optimize assets and disable dev-only features
ENV NODE_ENV=production

# 5. Disable Next.js Telemetry (Optional, speeds up build slightly)
ENV NEXT_TELEMETRY_DISABLED=1

# 6. Build the application
# This generates the optimized .next folder
RUN pnpm build

EXPOSE 3000

# 7. Start the production server
# Usually runs "next start"
CMD ["pnpm", "start"]