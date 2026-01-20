export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

export type NotesArray = Note[];
