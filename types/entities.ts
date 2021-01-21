interface Entity {
  _id: string;
  createdAt: string;
}

export interface User extends Entity {
  username: string;
}

export interface Comment extends Entity {
  text: string;
  user: User | string;
  points: number;
  children?: string[] | Comment[];
}

export interface Post extends Entity {
  title: string;
  text: string;
  user: User | string;
}
