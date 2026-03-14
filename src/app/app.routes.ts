import { LoginComponant } from './pages/login-componant/login-componant';
import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { authGuard } from './auth/auth-guard/auth-guard-guard';
import { loginGuard } from './auth/login-guard/login-guard-guard';
import { DashboardComponent } from './pages/dashboard-componant/dashboard-componant';
import { EmployeesComponant } from './pages/employees-componant/employees-componant';
import { BlogsComponant } from './pages/blogs-componant/blogs-componant';
import { SectorsComponant } from './pages/sectors-componant/sectors-componant';
import { ProjectsComponant } from './pages/projects-componant/projects-componant';
import { ProductsComponant } from './pages/products-componant/products-componant';
import { ChangePasswordComponent } from './pages/change-password-componant/change-password-componant';
import { adminGuard } from './guards/admin-guard.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', canActivate: [loginGuard], component: LoginComponant },
      { path: 'change_password', canActivate: [authGuard], component: ChangePasswordComponent }
    ]
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'blogs', pathMatch: 'full' },
      { path: 'employees', canActivate: [adminGuard], component: EmployeesComponant },
      { path: 'blogs', component: BlogsComponant },
      { path: 'sectors', component: SectorsComponant },
      { path: 'projects', component: ProjectsComponant },
      { path: 'products', component: ProductsComponant }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];