import { IdentityClientOptions, UserResponse } from "./types";
import axios from "axios";

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
class IdentityClient {
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
  constructor(private readonly options: IdentityClientOptions) {
    !options.identityUrl &&
      (this.options.identityUrl = "https://identity.assistantscenter.com");
  }

  /**
   * @method getUrl
   * @description Get the URL to redirect the user to
   * @returns {string} The URL
   * @example
   * const url = identityClient.getUrl();
   * // https://identity.assistantscenter.com/api/auth/authorize?client_id=client_id&redirect_uri=https://example.com/redirect&scope=admin%20account%3Aread
   */
  public getUrl() {
    return `${this.options.identityUrl}/api/auth/authorize?client_id=${
      this.options.clientId
    }&redirect_uri=${this.options.redirectUri}&scope=${this.options.scopes.join(
      "%20"
    )}`;
  }

  /**
   * @method getAccessToken
   * @param code The code from the redirect
   * @description Get the access token
   * @returns {Promise<{access_token: string}>} The access token
   * @example
   * const token = await identityClient.getAccessToken("code");
   */
  public async getAccessToken(code: string) {
    const res = await axios.post<{
      access_token: string;
    }>(`${this.options.identityUrl}/api/auth/token`, {
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      redirect_uri: this.options.redirectUri,
      code,
    });

    return res.data;
  }

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
  public async getUserInfo(accessToken: string) {
    const res = await axios.get<UserResponse>(
      `${this.options.identityUrl}/api/auth/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data;
  }
}

export default IdentityClient;
