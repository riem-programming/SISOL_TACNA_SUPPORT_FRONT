export interface JwtPayload {
  sub: number;
  username: string;
  exp: number;
  iat: number;
}
