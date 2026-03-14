export interface Project {
  id: number;
  title: string;
  description?: string;
  sectorId?: number;
  imagePublicId?: string;
  imageUrl?: string;
  sector:{
    id: number;
    title: string;
  },
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
}
