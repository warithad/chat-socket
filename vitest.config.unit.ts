import { defineConfig } from 'vitest/config'
//import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts']
  },
  resolve: {
    alias: {
      auth: '/src/auth',
      chatroom: '/src/chatroom',
      lib: '/src/lib'
    }
  },
//  plugins: [tsConfigPaths()]
})
