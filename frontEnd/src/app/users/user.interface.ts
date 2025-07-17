
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  groups: { name: string }[];
  group_name?: string | null;
}

export interface Group {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
}

export interface CreateUser {
  username: string;
  full_name: string;
  email: string;
  password: string;
  groups: number[];
}

export interface CreateGroup {
  name: string;
  permissions: number[];
}