import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IArtwork } from '../../interfaces/i-artwork';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-artwork-favorites',
  standalone: true,
  imports: [ArtworkRowComponent, CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {


  quadresFav: IArtwork[] = [];
  noHayLikes: boolean = false;

  constructor(
    private usersService: UsersService,
    private apiService: ApiServiceService,
    private router : Router,
  ) {}

  ngOnInit(): void {
    this.checkUserLoginStatus();
  }
  
  checkUserLoginStatus(): void {
    this.usersService.isLogged().then((logged) => {
      if (!logged) {
        console.log("not logged");
      } else {
        this.loadFavorites();
      }
    });
  }

  loadFavorites(): void {
    this.usersService.isLogged().then((logged) => {
      if (!logged) {
        
      } else {
        this.subscribeToFavorites();
        this.usersService.getFavorites();
      }
    });
  }

  subscribeToFavorites(): void {
    this.usersService.favoritesSubject.subscribe((data) => {
      this.handleFavoritesData(data);
    });
  }
  
  handleFavoritesData(data: any[]): void {
    if (data.length === 0) {
      this.noHayLikes = this.quadresFav.every((quadre) => !quadre.like);
    }
  
    let artworksIds = data.map((item) => item.id_artwork);
  
    this.apiService.getArtworksFromIDs(artworksIds).subscribe((artworkList: IArtwork[]) => {
      this.quadresFav = artworkList;
    });
  }
  

  delete(quadre : any) {
    this.usersService.deleteFavorites(quadre.id);
    this.router.navigate(['artworks']);
    }

}
