import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './component/Authorization/token.interceptor';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { DeletedComponent } from './component/deleted/deleted.component';
import { NavbarComponent } from './component/shared/navbar/navbar.component';
import { ProfileComponent } from './component/profile/profile.component';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { NgChartsModule } from 'ng2-charts';
import { CalendarComponent } from './component/calendar/calendar.component';
import { TaskCardComponent } from './component/shared/task-card/task-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanComponent } from './component/kanban/kanban.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    LandingPageComponent,
    AdminDashboardComponent,
    DeletedComponent,
    NavbarComponent,
    ProfileComponent,
    AnalyticsComponent,
    CalendarComponent,
    TaskCardComponent,
    KanbanComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    DragDropModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
