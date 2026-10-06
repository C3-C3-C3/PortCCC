export type AppState = 'hero' | 'projects' | 'services' | 'about';

export interface Project {
  id: string;
  title: string;
  tags: string;
  color: string;
  gradient: string;
  details: string;
  image?: string;
  images?: string[];
  video?: string;
  videos?: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  gradient: string;
  media?: string[];
  projects?: Project[];
}
