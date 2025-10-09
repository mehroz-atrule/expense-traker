export interface Office { _id: string; name: string }

export interface User {
  _id: string;
  username: string;
  email?: string;
  role?: string;
  officeId?: string;
}

export interface CreateOfficePayload { id?: string; name: string }
export interface UpdateOfficePayload { name: string }

export interface CreateUserPayload {
  id?: string;
  username?: string;
  name?: string;
  email: string;
  password?: string;
  role?: string;
  officeId?: string;
}

export interface UpdateUserPayload {
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  officeId?: string;
}


