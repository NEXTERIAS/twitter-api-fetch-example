import { oauth1a } from 'https://deno.land/x/twitter_api_fetch/mod.ts'
import { config } from "https://deno.land/x/dotenv/mod.ts";

const {
  TWITTER_API_ACCESS_TOKEN,
  TWITTER_API_SECRET_ACCESS_TOKEN,
  TWITTER_API_CONSUMER_KEY,
  TWITTER_API_SECRET_CONSUMER_KEY
} = config()

const fetcher = await oauth1a({
  accessToken: TWITTER_API_ACCESS_TOKEN,
  secretAccessToken: TWITTER_API_SECRET_ACCESS_TOKEN,
  consumerKey: TWITTER_API_CONSUMER_KEY,
  secretConsumerKey: TWITTER_API_SECRET_CONSUMER_KEY
})

const response = await fetcher('/2/users/910317474951786496/tweets')

console.log(await response.json())
