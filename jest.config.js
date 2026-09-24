const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
    'lib/helpers/**/*.{js,jsx,ts,tsx}',
    'lib/getters/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
    '!middleware.ts',
  ],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // @algolia/autocomplete-theme-classic's package.json "main" points straight at a .css
    // file, so a bare `import '@algolia/autocomplete-theme-classic'` never gets a .css
    // suffix for the mapper above to match — map the package itself.
    '^@algolia/autocomplete-theme-classic$': '<rootDir>/__mocks__/styleMock.js',

    // Same issue for swiper's CSS subpath exports (`swiper/css`, `swiper/css/navigation`, ...) —
    // the import specifier has no .css suffix even though it resolves to one.
    '^swiper/css.*$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': `<rootDir>/__mocks__/fileMock.js`,
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/components/$1',
    // Handle Lib aliases
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    // Handle context aliases
    '^@/context(.*)$': '<rootDir>/context/$1',
    // Handle mock aliases
    '^@/__mocks__/(.*)$': '<rootDir>/__mocks__/$1',
    // Handle test aliases
    '^@/__test__/(.*)$': '<rootDir>/__test__/$1',
    // Handle hooks aliases
    '^@/hooks(.*)$': '<rootDir>/hooks/$1',
    // Handle pages aliases
    '^@/pages/(.*)$': '<rootDir>src/pages/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
  testPathIgnorePatterns: [
    '/__test__/e2e/integration/', // Ignore the integration folder
  ],
  setupFilesAfterEnv: ['./jestSetup.js'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
