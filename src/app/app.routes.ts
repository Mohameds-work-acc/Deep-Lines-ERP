import { LoginComponant } from './pages/login-componant/login-componant';
import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginComponant },
    ]
  },
  {
    path: '',
    component: MainLayout,
    children: [
    ]
  }

]
