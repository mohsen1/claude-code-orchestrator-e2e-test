export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface Tag {
  name: string;
  count: number;
}
