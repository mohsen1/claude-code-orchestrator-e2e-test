#!/usr/bin/env node

import { Command } from 'commander';
import { addNote, listNotes, deleteNote, searchNotes } from './notes';

const program = new Command();

program
  .name('notes')
  .description('A simple command-line note-taking app')
  .version('1.0.0');

program
  .command('add')
  .description('Add a new note')
  .requiredOption('-t, --title <title>', 'Title of the note')
  .requiredOption('-c, --content <content>', 'Content of the note')
  .action((options) => {
    addNote(options.title, options.content);
  });

program
  .command('list')
  .description('List all notes')
  .action(() => {
    listNotes();
  });

program
  .command('delete')
  .description('Delete a note by ID')
  .requiredOption('-i, --id <id>', 'ID of the note to delete', (value) => {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      console.error('✗ Invalid ID. Please provide a valid number.');
      process.exit(1);
    }
    return id;
  })
  .action((options) => {
    deleteNote(options.id);
  });

program
  .command('search')
  .description('Search notes by keyword')
  .requiredOption('-k, --keyword <keyword>', 'Keyword to search for')
  .action((options) => {
    searchNotes(options.keyword);
  });

program.parse();
