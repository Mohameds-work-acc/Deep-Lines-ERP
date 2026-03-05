export interface Comment {
  id: number;
  content: string;
  author?: string;
  createdAt?: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  author?: {
    Id: number;
    name: string;
    email: string;
  };
  updatedBy?: {
    Id: number;
    name: string;
    email: string;
  };
  published_date: string; // ISO string
  comments?: Comment[];
}
