import { defineConfig } from 'vite';

// Empacota apenas os componentes Material Web usados + lógica do tema
// em um único ES module (dist/theme.js), minificado.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.js',
      formats: ['es'],
      fileName: () => 'theme.js',
    },
    rollupOptions: {
      output: {
        // Um único arquivo, sem chunks dinâmicos
        inlineDynamicImports: true,
      },
    },
  },
});
