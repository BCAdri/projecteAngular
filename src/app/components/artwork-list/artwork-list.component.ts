import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { debounceTime } from 'rxjs';
import { IArtwork } from '../../interfaces/i-artwork';
import { FilterService } from '../../services/filter.service';
import { ApiServiceService } from '../../services/api-service.service';

import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ArtworkComponent } from '../artwork/artwork.component';
import { UsersService } from '../../services/users.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [CommonModule,ArtworkComponent,ArtworkRowComponent,ArtworkFilterPipe,FormsModule,],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css',
})
export class ArtworkListComponent {

  url: string = `https://api.artic.edu/api/v1/artworks`;

  SearchActive: boolean = false;


  filter: string = '';
  art: IArtwork[] = [];
  mouseover: boolean = false;

  currentPage: number = 1;
  totalPage!: number;
  numberPage!: number;



  constructor(
    private usersService: UsersService,
    private artService: ApiServiceService,
    private filterService: FilterService,
    private router: ActivatedRoute,
  ) {
    this.SearchActive = false;
  }

  ngOnInit(): void {

    this.setSearch();
    this.updateTotalPage();

    if (!this.SearchActive) {
      this.artService.getArtWorks().subscribe((artworkList: IArtwork[]) => {
        this.art = artworkList;
      });
    } else {
      this.filterService.searchFilter
        .pipe(debounceTime(500))
        .subscribe((filter) => {
          console.log('Filtro:', filter);
          this.artService
            .filterArtWorks(filter)
            .subscribe((artworkList: IArtwork[]) => {
              this.art = artworkList;
            });
        });
      this.filterService.searchFilter.next(this.filter); 
    }
  }

  updateTotalPage(): void {
    let urlSearch = this.SearchActive
      ? `${this.url}/search?q=${this.filter}`
      : this.url;
    this.artService.getArtWorksAll(urlSearch).subscribe((totalPages) => {
      this.totalPage = totalPages;
      if (this.SearchActive)
        this.totalPage = this.totalPage >= 100 ? 100 : this.totalPage;
      this.currentPage = 1; 
    });
  }

  setSearch(): void {
    this.router.paramMap.subscribe((params) => {
      const seachFilter = params.get('search');
      if (seachFilter) {
        this.filter = seachFilter; 
        this.SearchActive = true; 
        this.updateTotalPage(); 
        this.filterService.searchFilter.next(this.filter); 
      }
    });
  }

  async toggleLike($event: boolean, artwork: IArtwork) {
    this.usersService.isLogged().then((logged) => {
      if (!logged){ 
    } else {
        artwork.like = !artwork.like;
        this.usersService.setFavorites(artwork.id + '');
      }
    });
  }

  pag(param: string) {
    switch (param) {

      case 'numberPage':
        if (this.numberPage <= this.totalPage && this.numberPage >= 1)
          this.currentPage = this.numberPage;
        break;

      case 'next':
        if (this.currentPage < this.totalPage) this.currentPage++;
        break;

      case 'back':
        if (this.currentPage != 1) this.currentPage--;
        break;

    
    }
    let urlSearch = this.SearchActive
      ? `${this.url}/search?q=${this.filter}&fields=id,description,title,image_id&page=${this.currentPage}`
      : `${this.url}?page=${this.currentPage}`;

    console.log(urlSearch);

    this.artService
      .getArtWorksPage(urlSearch)
      .subscribe((artworkList: IArtwork[]) => {
        this.art = artworkList;
        window.scrollTo(0, 0);
      });
  }

}








