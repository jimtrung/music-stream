export interface SignUpRequest { 
  username: string,
  email: string,
  password: string
}

export interface SignInRequest {
  username: string,
  password: string
}

export interface RefreshResponse {
  refreshToken: string
}

export interface ResendVerificationEmailRequest {
  email: string
}

export interface UpdateProfileRequest { 
  name?: string,
  avatar?: any
}

export interface SignInResponse {
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}
