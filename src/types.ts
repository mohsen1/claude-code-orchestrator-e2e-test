export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteWithHtml extends Note {
  html: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface TagWithCount {
  name: string;
  count: number;
}

export interface NoteListQuery {
  tag?: string;
  search?: string;
}
