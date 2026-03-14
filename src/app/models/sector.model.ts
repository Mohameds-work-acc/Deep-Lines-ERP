export interface Sector {
  id: number;
  title: string;
  description?: string;
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
  relatedProductsCount?: number;
}
