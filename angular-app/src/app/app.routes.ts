import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { IpLookupComponent } from './ip-lookup.component';
import { TodoComponent } from './todo.component';
import { LoginComponent } from './login.component';
import { ListsComponent } from './lists.component';
import { ProfileComponent } from './profile/profile';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ip-lookup', component: IpLookupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'lists', component: ListsComponent, canActivate: [AuthGuard] },
  { path: 'todo/:id', component: TodoComponent, canActivate: [AuthGuard] },
  { path: 'todo', redirectTo: '/lists', pathMatch: 'full' },
  { path: 'quotes', loadComponent: () => import('./quotes.component').then(m => m.QuotesComponent) },
];
