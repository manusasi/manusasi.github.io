import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos$: Observable<Todo[]>;
  newTodoTitle = '';
  editingTodo: Todo | null = null;
  originalTitle = '';

  constructor(private todoService: TodoService) {
    this.todos$ = this.todoService.getTodos();
  }

  ngOnInit(): void {}

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      this.todoService.addTodo(this.newTodoTitle.trim());
      this.newTodoTitle = '';
    }
  }

  toggleCompletion(todo: Todo): void {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed });
  }

  editTodo(todo: Todo): void {
    this.editingTodo = { ...todo };
    this.originalTitle = todo.title;
  }

  saveTodo(): void {
    if (this.editingTodo) {
      if (this.editingTodo.title.trim()) {
        this.todoService.updateTodo(this.editingTodo);
        this.editingTodo = null;
      }
    }
  }

  cancelEdit(): void {
    this.editingTodo = null;
  }

  deleteTodo(id: string | undefined): void {
    if (id) {
      this.todoService.deleteTodo(id);
    }
  }
} 