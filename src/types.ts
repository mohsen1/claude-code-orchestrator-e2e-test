export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteData {
  title: string;
  content: string;
  tags?: string[];
}

export interface NoteUpdates {
  title?: string;
  content?: string;
  tags?: string[];
}
