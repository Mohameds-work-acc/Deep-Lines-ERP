export interface Product {
  id: number;
  title: string;
  description?: string;
  price?: number;
  projectId?: number;
  imagePublicId?: string;
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
  published_data?: string;
  sector:{
    id: number;
    title: string;
  }
}
