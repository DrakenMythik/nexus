import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const layerOrder = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

/** @param {string} layer */
function allowBelow(layer) {
  const idx = layerOrder.indexOf(layer);
  if (idx < 0) return [];
  return layerOrder.slice(idx + 1);
}

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.config.{js,ts,cjs,mjs}',
      'vite.config.ts'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
      'react-hooks': reactHooks
    },
    settings: {
      'boundaries/basePath': 'src',
      'boundaries/include': ['**/*.{ts,tsx,d.ts}'],
      'boundaries/elements': [
        // app can contain non-sliced entrypoints
        { type: 'app', pattern: '*.{ts,tsx,d.ts}' },
        { type: 'app', pattern: 'app/**' },
        { type: 'app', pattern: 'styles/**' },
        { type: 'app', pattern: 'sw.ts' },
        { type: 'pages', pattern: 'pages/*' },
        { type: 'widgets', pattern: 'widgets/*' },
        { type: 'features', pattern: 'features/*' },
        { type: 'entities', pattern: 'entities/*' },
        { type: 'shared', pattern: 'shared/*' }
      ]
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'boundaries/no-unknown': 'error',
      // Some root-level `src/*` entrypoints (e.g. `main.tsx`, `sw.ts`) are not FSD slices.
      // We still enforce all layer-to-layer boundaries; we just don't require every file to map to an element.
      'boundaries/no-unknown-files': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Always allow dependencies within the same element (slice internal imports).
            { from: {}, allow: { dependency: { relationship: { from: 'internal' } } } },

            // Enforce strict FSD unidirectional layer imports (strictly below only).
            { from: { type: 'app' }, allow: { to: { type: allowBelow('app') } } },
            { from: { type: 'pages' }, allow: { to: { type: allowBelow('pages') } } },
            { from: { type: 'widgets' }, allow: { to: { type: allowBelow('widgets') } } },
            { from: { type: 'features' }, allow: { to: { type: allowBelow('features') } } },
            { from: { type: 'entities' }, allow: { to: { type: allowBelow('entities') } } },
            { from: { type: 'shared' }, allow: { to: { type: allowBelow('shared') } } }
          ]
        }
      ],
      // Enforce slice public APIs: import only from `.../<slice>` or `.../<slice>/index`
      // Disallows deep imports like `features/auth/model/...` or `shared/ui/Button/Button`.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // app
            'src/app/*/*',
            'src/app/*/*/**',
            // pages
            'src/pages/*/*',
            'src/pages/*/*/**',
            // widgets
            'src/widgets/*/*',
            'src/widgets/*/*/**',
            // features
            'src/features/*/*',
            'src/features/*/*/**',
            // entities
            'src/entities/*/*',
            'src/entities/*/*/**',
            // shared (still requires public API per segment)
            'src/shared/*/*',
            'src/shared/*/*/**'
          ]
        }
      ]
    }
  },
);

