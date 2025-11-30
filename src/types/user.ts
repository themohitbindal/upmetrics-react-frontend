export interface User {
  _id: string
  email: string
  name?: string
  age?: number
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface SignUpData {
  email: string
  password: string
  name?: string
  age?: number
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  age?: number
}
