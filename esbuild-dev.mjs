import * as esbuild from 'esbuild'
import { config } from './esbuild-config.mjs'


let ctx = await esbuild.context({... config
  // minify: true, // Optional: minify the output
  //  sourcemap: true, // Optional: generate a source map
})

await ctx.watch()
console.log("watching...")
