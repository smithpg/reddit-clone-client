export interface Entity {
  _id: string;
  createdAt: string;
}

export interface User extends Entity {
  username: string;
  posts?: Post[];
  comments?: Comment[];
}

export interface NormalizedUser extends Entity {
  username: string;
  posts: string[];
  comments: string[];
}

export interface Comment extends Entity {
  text: string;
  user: string;
  points: number;
  children?: Comment[];
  parent?: string;
}

export interface Post extends Entity {
  title: string;
  text: string;
  user: User | string;
  comments?: Comment[];
  points: number;
  commentCount?: number;
}

export interface NormalizedPost extends Entity {
  title: string;
  text: string;
  user: string;
  comments: string[];
  points: number;
  commentCount?: number;
}
