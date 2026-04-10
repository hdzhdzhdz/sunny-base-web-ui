import type { Config } from 'tailwindcss'
import sharedConfig from '@sunny-base-web/tailwind-config'

const config: Config = {
  ...sharedConfig,
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
}

export default config
