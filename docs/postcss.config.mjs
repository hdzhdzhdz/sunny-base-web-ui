import { postcssIsolateStyles } from 'vitepress'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/]
    })
  ]
}
