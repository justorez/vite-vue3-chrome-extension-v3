import { dirname, relative } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { defineConfig, type Plugin } from 'vite'
// import VueDevTools from 'vite-plugin-vue-devtools'
import { defineViteConfig as define } from './define.config'
import manifest from './manifest.config'
import packageJson from './package.json'

const transformHtmlPlugin = (data) =>
  <Plugin>{
    name: 'transform-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<%=\s*(\w+)\s*%>/gi, (_, p) => data[p] || '')
      }
    }
  }

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    crx({ manifest }),

    VueRouter({
      root: '.',
      // Add your own custom pages here. Just add it to the array. Example: 'src/welcome/pages'
      routesFolder: [
        { src: 'src/pages', path: 'common/' },
        { src: 'src/content-script/iframe/pages', path: 'iframe/' },
        { src: 'src/options/pages', path: 'options/' },
        { src: 'src/popup/pages', path: 'popup/' },
        { src: 'src/setup/pages', path: 'setup/' },
        { src: 'src/main/pages', path: 'main/' }
      ],
      dts: 'src/typed-router.d.ts',
      extensions: ['.vue']
    }),

    vue(),

    // VueDevTools(), // No working

    AutoImport({
      imports: ['vue', VueRouterAutoImports, 'vue/macros', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables/']
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ['src/components'],
      // generate `components.d.ts` for ts support with Volar
      dts: 'src/components.d.ts',
      resolvers: [
        // auto import icons
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['mdi']
        })
      ]
    }),

    // https://github.com/antfu/unplugin-icons
    Icons({
      autoInstall: true,
      compiler: 'vue3',
      scale: 1.5
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      order: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`
        )
      }
    },

    transformHtmlPlugin({
      HTML_TITLE: packageJson.displayName || packageJson.name
    })
  ],
  define,
  build: {
    rollupOptions: {
      input: {
        iframe: 'src/content-script/iframe/index.html',
        setup: 'src/setup/index.html',
        main: 'src/main/index.html'
      }
    }
  },
  server: {
    port: 8888,
    strictPort: true,
    hmr: {
      port: 8889,
      overlay: false
    }
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core'],
    exclude: ['vue-demi']
  }
})
