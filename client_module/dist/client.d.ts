import { IdentityClientOptions, UserResponse } from "./types";
/**
 * @class IdentityClient
 * @description A client for interacting with the Identity API
 * @param {IdentityClientOptions} options The options for the client
 * @param {string} options.clientId The client ID
 * @param {string} options.clientSecret The client secret
 * @param {string} options.redirectUri The redirect URI
 * @param {ClientScope[]} options.scopes The scopes to request
 * @param {string} [options.identityUrl] The URL of the Identity API
 *
 * @example
 * const identityClient = new IdentityClient({
 *    clientId: "client_id",
 *    clientSecret: "client_secret",
 *    redirectUri: "https://example.com/redirect",
 *    scopes: ["admin", "account:read"],
 *    identityUrl: "https://identity.assistantscenter.com"
 *  });
 *
 *  // Get the URL to redirect the user to
 *  const url = identityClient.getUrl();
 *  // https://identity.assistantscenter.com/api/auth/authorize?client_id=client_id&redirect_uri=https://example.com/redirect&scope=admin%20account%3Aread
 *
 *  // Get the access token
 *  const token = await identityClient.getAccessToken("code");
 *
 *  // Get the user info
 *  const user = await identityClient.getUserInfo(token.access_token);
 */
declare class IdentityClient {
    private readonly options;
    /**
     * @constructor
     * @description Create a new IdentityClient
     * @param {IdentityClientOptions} options The options for the client
     * @param {string} options.clientId The client ID
     * @param {string} options.clientSecret The client secret
     * @param {string} options.redirectUri The redirect URI
     * @param {ClientScope[]} options.scopes The scopes to request
     * @param {string} [options.identityUrl] The URL of the Identity API
     *
     * @example
     * const identityClient = new IdentityClient({
     *    clientId: "client_id",
     *    clientSecret: "client_secret",
     *    redirectUri: "https://example.com/redirect",
     *    scopes: ["admin", "account:read"],
     *    identityUrl: "https://identity.assistantscenter.com"
     * });
     */
    constructor(options: IdentityClientOptions);
    /**
     * @method getUrl
     * @description Get the URL to redirect the user to
     * @returns {string} The URL
     * @example
     * const url = identityClient.getUrl();
     * // https://identity.assistantscenter.com/api/auth/authorize?client_id=client_id&redirect_uri=https://example.com/redirect&scope=admin%20account%3Aread
     */
    getUrl(): string;
    /**
     * @method getAccessToken
     * @param code The code from the redirect
     * @description Get the access token
     * @returns {Promise<{access_token: string}>} The access token
     * @example
     * const token = await identityClient.getAccessToken("code");
     */
    getAccessToken(code: string): Promise<{
        access_token: string;
    }>;
    /**
     * @method getUserInfo
     * @param accessToken The access token
     * @description Get the user info
     * @returns {Promise<UserResponse>} The user info
     * @example
     * const user = await identityClient.getUserInfo(token.access_token);
     * // {
     * //   id: "user_id",
     * //   username: "username",
     * //   email: "email@example.com",
     * //   avatar: "https://example.com/avatar.png",
     * //   verified: true,
     * //   allow_marketing: true,
     * //   roles: ["admin"],
     * //   connections: {
     * //     discord: {
     * //       id: "discord_id"
     * //     },
     * //     google: {
     * //       id: "google_id"
     * //     },
     * //     github: {
     * //       id: "github_id"
     * //     }
     * //   }
     * // }
     */
    getUserInfo(accessToken: string): Promise<UserResponse>;
}
export default IdentityClient;
