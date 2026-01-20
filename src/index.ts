#!/usr/bin/env node

import { Command } from 'commander';
import { addTodo, listTodos, completeTodo, deleteTodo } from './todo';

const program = new Command();

program
  .name('todo')
  .description('A simple command-line todo list manager')
  .version('1.0.0');

program
  .command('add <text>')
  .description('Add a new todo item')
  .action((text: string) => {
    const todo = addTodo(text);
    console.log(`✓ Added todo #${todo.id}: ${todo.text}`);
  });

program
  .command('list')
  .description('List all todo items')
  .action(() => {
    const todos = listTodos();
    if (todos.length === 0) {
      console.log('No todos found.');
      return;
    }
    console.log('\nYour Todos:');
    console.log('─'.repeat(50));
    todos.forEach(todo => {
      const status = todo.completed ? '✓' : '○';
      console.log(`${status} [${todo.id}] ${todo.text}`);
    });
    console.log('─'.repeat(50));
    console.log(`Total: ${todos.length} todo(s)\n`);
  });

program
  .command('complete <id>')
  .description('Mark a todo as complete')
  .action((id: string) => {
    const todoId = parseInt(id, 10);
    const todo = completeTodo(todoId);
    if (todo) {
      console.log(`✓ Marked todo #${todo.id} as complete: ${todo.text}`);
    } else {
      console.error(`✗ Todo #${todoId} not found.`);
    }
  });

program
  .command('delete <id>')
  .description('Delete a todo item')
  .action((id: string) => {
    const todoId = parseInt(id, 10);
    const todo = deleteTodo(todoId);
    if (todo) {
      console.log(`✓ Deleted todo #${todo.id}: ${todo.text}`);
    } else {
      console.error(`✗ Todo #${todoId} not found.`);
    }
  });

program.parse(process.argv);
