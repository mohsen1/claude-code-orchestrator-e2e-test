export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export type CreateUserInput = {
  email: string;
  name: string;
  image?: string;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'email'>>;
