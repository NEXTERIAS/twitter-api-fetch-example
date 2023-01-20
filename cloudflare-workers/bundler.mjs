import { $, fs } from 'zx'

const { devDependencies } = JSON.parse(await fs.readFile('./package.json'))

await $`deno bundle https://deno.land/x/twitter_api_fetch@v${devDependencies['twitter-api-fetch']}/mod.ts -- ./src/twitter-api-fetch.js`
