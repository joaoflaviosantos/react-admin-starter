export type UserTokenRead = {
  id: string;
  profile_image_url?: string;
  default_language: string;
  name: string;
  email: string;
};

export type TokenRead = {
  access_token: string;
  token_type: string;
};

export type UserAuthRead = TokenRead & {
  user: UserTokenRead;
};
