
export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Section {
  title: string;
  content: string;
}

export interface Module {
  title:string;
  sections: Section[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: string;
  isCompleted?: boolean;
}

export type View = 'new' | 'list' | 'detail';