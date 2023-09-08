import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import stylelint from 'rollup-plugin-stylelint';
import { viteMockServe } from 'vite-plugin-mock';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { createStyleImportPlugin } from 'vite-plugin-style-import';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      createStyleImportPlugin({
        libs: [
          {
            libraryName: 'ant-design-vue',
            esModule: true,
            resolveStyle: (name) => {
              return `ant-design-vue/es/${name}/style/index`;
            },
          },
          {
            libraryName: '@icon-park/vue-next',
            esModule: true,
            resolveComponent: (name) => {
              return `@icon-park/vue-next/es/icons/${name}`;
            },
          },
        ],
      }),
      stylelint({
        include: ['src/**/*.{vue,html,css,scss,sass,less}'],
        failOnError: false,
        cache: false,
        fix: false,
      }),
      viteMockServe({
        supportTs: false,
        localEnabled: command === 'serve',
      }),
      VitePWA({
        manifest: {
          name: 'PPTist',
          short_name: 'PPTist',
          theme_color: '#d14424',
          icons: [{
            src: 'icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }, {
            src: 'icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }, {
            src: 'icons/android-chrome-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }, {
            src: 'icons/android-chrome-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }],
          start_url: '.',
          display: 'standalone',
          background_color: '#000000',
        },
        workbox: {
          runtimeCaching: [{
            urlPattern: /.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'PPTist',
              expiration: {
                maxAgeSeconds: 60 * 60 * 10,
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }],
          include: [/\.ttf$/],
          skipWaiting: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import '@/assets/styles/variable.scss';
            @import '@/assets/styles/mixin.scss';
          `,
        },
        less: {
          modifyVars: {
            'primary-color': '#d14424',
            'text-color': '#41464b',
            'font-size-base': '13px',
            'border-radius-base': '2px',
          },
          javascriptEnabled: true,
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:9000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
