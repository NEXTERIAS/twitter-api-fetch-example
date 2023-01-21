import { oauth1a } from 'twitter-api-fetch/edge'

export interface Env {
	TWITTER_API_ACCESS_TOKEN: string
	TWITTER_API_SECRET_ACCESS_TOKEN: string
	TWITTER_API_CONSUMER_KEY: string
	TWITTER_API_SECRET_CONSUMER_KEY: string
}

export default {
	async fetch(
		_request: Request,
		env: Env,
		_ctx: ExecutionContext
	): Promise<Response> {
		const fetcher = await oauth1a({
			accessToken: env.TWITTER_API_ACCESS_TOKEN,
			consumerKey: env.TWITTER_API_CONSUMER_KEY,
			secretAccessToken: env.TWITTER_API_SECRET_ACCESS_TOKEN,
			secretConsumerKey: env.TWITTER_API_SECRET_CONSUMER_KEY
		})
		const response = await fetcher(
      "/2/users/910317474951786496/tweets",
			{
				cf: {
					cacheTtl: 600
				}
			}
    );

    if (!response.ok) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const tweets = await response.json();

    console.log(tweets);

    return new Response(JSON.stringify(tweets));
	},
};
