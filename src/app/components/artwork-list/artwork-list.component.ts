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
 enteredPageNumber!: number;
  isMouseOver: boolean = false;

  apiEndpoint: string = `https://api.artic.edu/api/v1/artworks`;

  art: IArtwork[] = [];

  currentPage: number = 1;
  totalPageCount!: number;

  constructor(
    private usersService: UsersService,
    private artService: ApiServiceService,
    private filterService: FilterService,
    private route: ActivatedRoute,
  ) {
    this.search = false;
  }

  ngOnInit(): void {

    this.initializeSearch();
    this.updateTotalPages();

    if (!this.search) {
      this.artService.getArtWorks().subscribe((artworkList: IArtwork[]) => {
        this.art = artworkList;
      });
    } else {
      this.filterService.searchFilter.pipe(debounceTime(300)).subscribe((filter) => {console.log('Filter:', filter);
      this.artService.filterArtWorks(filter).subscribe((artworkList: IArtwork[]) => {
      this.art = artworkList;});
      });
      this.filterService.searchFilter.next(this.searchFilter); 
    }
  }

  initializeSearch(): void {
    this.route.paramMap.subscribe((params) => {
      const searchFilter = params.get('search');
      if (searchFilter) {
        this.searchFilter = searchFilter; 
        this.search = true; 
        this.updateTotalPages(); 
        this.filterService.searchFilter.next(this.searchFilter); 
      }
    });
  }
  search: boolean = false;

  pag(param: string) {
    switch (param) {

              case 'enteredPageNumber':
                if (this.enteredPageNumber <= this.totalPageCount && this.enteredPageNumber >= 1)
                  this.currentPage = this.enteredPageNumber;
                break;
        
              case 'next':
                if (this.currentPage < this.totalPageCount) this.currentPage++;
                break;
        
              case 'back':
                if (this.currentPage != 1) this.currentPage--;
                break;

    }
    let pageUrl = this.search
          ? `${this.apiEndpoint}/search?q=${this.searchFilter}&fields=id,description,title,image_id&page=${this.currentPage}`
          : `${this.apiEndpoint}?page=${this.currentPage}`;


    this.artService.getArtWorksPage(pageUrl).subscribe((artworkList: IArtwork[]) => {
    this.art = artworkList;
        window.scrollTo(0, 0);
      });
  }
  searchFilter: string = '';
 async toggleLike($event: boolean, artwork: IArtwork) {
    this.usersService.isLogged().then((logged) => {
      if (!logged){ 
    } else {
        artwork.like = !artwork.like;
        this.usersService.setFavorites(artwork.id + '');
      }
    });
  }
  
   updateTotalPages(): void {
    let searchUrl = this.search
            ? `${this.apiEndpoint}/search?q=${this.searchFilter}`
            : this.apiEndpoint;
    this.artService.getArtWorksAll(searchUrl).subscribe((totalPages) => {
            this.totalPageCount = totalPages;
      if (this.search)
              this.totalPageCount = this.totalPageCount >= 100 ? 100 : this.totalPageCount;
              this.currentPage = 1; 
    });
  }
}





