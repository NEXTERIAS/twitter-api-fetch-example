// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const reservedCharacters = new Set([
    "!",
    "*",
    "'",
    "(",
    ")"
]);
function encode(value) {
    let encodedText = "";
    for (const string_ of encodeURIComponent(value)){
        if (!reservedCharacters.has(string_)) {
            encodedText += string_;
            continue;
        }
        encodedText += "%" + string_.codePointAt(0).toString(16);
    }
    return encodedText;
}
const base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
];
function encode1(data) {
    const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
    let result = "", i;
    const l = uint8.length;
    for(i = 2; i < l; i += 3){
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}
const combineKeys = (credentials)=>[
        credentials.secretConsumerKey,
        credentials.secretAccessToken
    ].map((it)=>encode(it)).join("&");
const createSigningKey = (credentials)=>{
    const key = combineKeys(credentials);
    const textEncoder = new TextEncoder();
    return crypto.subtle.importKey("raw", textEncoder.encode(key), {
        name: "HMAC",
        hash: "SHA-1"
    }, false, [
        "sign"
    ]);
};
const sign = async (key, request, params)=>{
    const clonedParams = new Map(params);
    clonedParams.set("oauth_signature_method", "HMAC-SHA1");
    const textEncoder = new TextEncoder();
    const url = new URL(request.url);
    const messageParameters = [
        ...clonedParams,
        ...url.searchParams
    ].map(([key, value])=>[
            encode(key),
            encode(value)
        ]).sort(([a], [b])=>a.localeCompare(b)).map((it)=>it.join("="));
    const message = [
        request.method.toUpperCase(),
        encode(url.origin + url.pathname),
        encode(messageParameters.join("&"))
    ].join("&");
    const hash = await crypto.subtle.sign({
        name: "HMAC",
        hash: "SHA-1"
    }, key, textEncoder.encode(message));
    clonedParams.set("oauth_signature", encode1(hash));
    return clonedParams;
};
const createBaseParams = (accessToken, consumerKey)=>{
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return new Map([
        [
            "oauth_consumer_key",
            consumerKey
        ],
        [
            "oauth_nonce",
            encode1(randomBytes)
        ],
        [
            "oauth_timestamp",
            (Date.now() / 1000).toFixed(0)
        ],
        [
            "oauth_token",
            accessToken
        ],
        [
            "oauth_version",
            "1.0"
        ]
    ]);
};
const createHttpHeader = (params)=>{
    const values = [
        ...params
    ].sort(([a], [b])=>a.localeCompare(b)).map(([key, value])=>[
            encode(key),
            `"${encode(value)}"`
        ].join("=")).join(", ");
    return new Headers({
        "Authorization": `OAuth ${values}`
    });
};
const resolveURL = (info)=>{
    const url = new URL(typeof info === "string" ? info : info.url, "https://api.twitter.com");
    if (url.protocol !== "https:") throw new Error("The protocol must be HTTPS.");
    if (url.hostname !== "api.twitter.com") {
        throw new Error('Requests can only be sent to "api.twitter.com".');
    }
    return url;
};
const fetcher = async (credentials)=>{
    const signingKey = await createSigningKey({
        secretAccessToken: credentials.secretAccessToken,
        secretConsumerKey: credentials.secretConsumerKey
    });
    return async (input, init)=>{
        const url = resolveURL(input);
        const request = new Request(url.toString(), init);
        const params = await sign(signingKey, request, createBaseParams(credentials.accessToken, credentials.consumerKey));
        const headers = createHttpHeader(params);
        for (const [name, value] of headers)request.headers.set(name, value);
        return fetch(request);
    };
};
export { fetcher as oauth1a };
