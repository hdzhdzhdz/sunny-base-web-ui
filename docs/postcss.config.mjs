import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/]
    })
  ]
}
