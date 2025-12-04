import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HueSync',
      fileName: 'index',
      formats: ['cjs'],
    },
    outDir: 'build',
    target: 'es2020',
    minify: true,
    rollupOptions: {
      external: ['node-dns-sd', 'node-dtls-client'],
      output: {
        preserveModules: false,
      },
    },
  },
  plugins: [
    dts({
      outDir: 'build',
      exclude: ['src/**/*.spec.ts', 'src/__mocks__/**'],
      rollupTypes: true,
    }),
  ],
});
