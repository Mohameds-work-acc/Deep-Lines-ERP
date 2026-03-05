import { LoginComponant } from './pages/login-componant/login-componant';
import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { authGuard } from './auth/auth-guard/auth-guard-guard';
import { loginGuard } from './auth/login-guard/login-guard-guard';
import { DashboardComponant } from './pages/dashboard-componant/dashboard-componant';
import { EmployeesComponant } from './pages/employees-componant/employees-componant';
import { BlogsComponant } from './pages/blogs-componant/blogs-componant';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [loginGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponant }
    ]
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponant },
      { path: 'employees', component: EmployeesComponant },
      { path: 'blogs', component: BlogsComponant }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
