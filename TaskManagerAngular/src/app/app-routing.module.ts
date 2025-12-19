import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { DeletedComponent } from './component/deleted/deleted.component';
import { ProfileComponent } from './component/profile/profile.component';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { CalendarComponent } from './component/calendar/calendar.component';
import { KanbanComponent } from './component/kanban/kanban.component';

import { AuthGuard } from './component/guard/auth.guard';
import { FallbackGuard } from './component/guard/fallback.guard';

const routes: Routes = [

  // 🌍 Public
  { path: '', component: LandingPageComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // 🔐 Protected
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'adminDashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'board',
    component: KanbanComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'recycle-bin',
    component: DeletedComponent,
    canActivate: [AuthGuard]
  },

  // 🚨 Wildcard — NO GUARD
  { path: '**', component: LandingPageComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
