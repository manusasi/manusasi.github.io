import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TodoComponent } from './todo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TodoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() { }
}
