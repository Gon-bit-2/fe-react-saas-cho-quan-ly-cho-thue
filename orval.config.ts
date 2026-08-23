import { defineConfig } from 'orval'

/**
 * Orval configuration: sinh code từ OpenAPI spec.
 *
 * - Input: docs/api/openapi.json (snapshot từ backend export)
 * - Output: tags-split → mỗi tag = 1 file hooks + models
 * - Client: react-query (TanStack Query v5)
 * - HTTP: custom Axios mutator (unwrap response.data, cancel support)
 * - Models: sinh riêng ở shared/api/generated/models
 *
 * Generated code được commit nhưng KHÔNG sửa tay.
 *
 * @see https://orval.dev/docs/reference/configuration/output/
 * @see https://orval.dev/docs/guides/react-query/
 */
export default defineConfig({
  api: {
    input: {
      target: './docs/api/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/shared/api/orval-mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useSuspenseQuery: false,
        },
      },
      mock: false,
      clean: true,
    },
  },
})
