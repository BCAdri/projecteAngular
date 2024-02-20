import { Routes } from '@angular/router';
import { ArtworkComponent } from './components/artwork/artwork.component';
import { ArtworkListComponent } from './components/artwork-list/artwork-list.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LogoutComponent } from './components/logout/logout.component';

export const routes: Routes = [
    {path: 'artworks', component: ArtworkListComponent},
    {path: 'artwork/:id', component: ArtworkComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'favorites', component: FavoritesComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'logout', component: LogoutComponent},
    { path: '**', component: ArtworkListComponent }
  
  ];
  