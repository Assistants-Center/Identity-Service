interface IJwtPayload {
  user_id: string;
  client_id: string;
  scopes: string[];
}

export { IJwtPayload };
