import { oauth1a } from "@nexterias/twitter-api-fetch";

const fetcher = await oauth1a({
  accessToken: process.env.TWITTER_API_ACCESS_TOKEN,
  secretAccessToken: process.env.TWITTER_API_SECRET_ACCESS_TOKEN,
  consumerKey: process.env.TWITTER_API_CONSUMER_KEY,
  secretConsumerKey: process.env.TWITTER_API_SECRET_CONSUMER_KEY
})

const response = await fetcher('/2/users/910317474951786496/tweets')

console.log(await response.json())

declare module "bun" {
  interface Env {
    TWITTER_API_ACCESS_TOKEN: string;
    TWITTER_API_SECRET_ACCESS_TOKEN: string;
    TWITTER_API_CONSUMER_KEY: string;
    TWITTER_API_SECRET_CONSUMER_KEY: string;
  }
}
