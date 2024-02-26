import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
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
export class ArtworkListComponent implements OnInit{
  enteredPageNumber!: number;
  entra: boolean = false;

  api: string = `https://api.artic.edu/api/v1/artworks`;

  art: IArtwork[] = [];

 
  constructor(
    private usersService: UsersService,
    private artService: ApiServiceService,
    private filterService: FilterService,
    private route: ActivatedRoute,
  ) {
    this.buscar = false;
  }

  ngOnInit(): void {

    this.inicializar();
    this.actualizarTotalDePaginas();

    if (!this.buscar) { this.artService.getArtWorks().subscribe((art: IArtwork[]) => {this.art = art; });
    } else {
      this.filterService.searchFilter.pipe(debounceTime(300)).subscribe((filter) => {console.log('Filter:', filter);
      this.artService.filterArtWorks(filter).subscribe((art: IArtwork[]) => { this.art = art; }); });
      this.filterService.searchFilter.next(this.filtro); 
    }
  }
  actual: number = 1;
  total!: number;

  inicializar(): void {
    this.route.paramMap.subscribe((params) => {
      const filt = params.get('search');
      if (filt) {
        this.buscar = true; 
        this.filtro = filt; 
        this.inicializar(); 
        this.filterService.searchFilter.next(this.filtro); 
      }
    });
  }
  buscar: boolean = false;

  pag(info: string) {
    switch (info) {

            case 'enteredPageNumber':
                if (this.enteredPageNumber <= this.total && this.enteredPageNumber >= 1)
                  this.actual = this.enteredPageNumber;
                break;
        
            case 'next':
                if (this.actual < this.total) this.actual++;
                break;
        
            case 'back':
                if (this.actual != 1) this.actual--;
                break;

    }


    let Url = this.buscar ? `${this.api}/search?q=${this.filtro}&fields=id,description,title,image_id&page=${this.actual}`
    : `${this.api}?page=${this.actual}`;


    this.artService.getArtWorksPage(Url).subscribe((quadro: IArtwork[]) => {
    this.art = quadro; window.scrollTo(0, 0); });
  }
  filtro: string = '';
 async toggleLike($event: boolean, artwork: IArtwork) {
    this.usersService.isLogged().then((logged) => {
      if (!logged){ 
    } else {
        artwork.like = !artwork.like;
        this.usersService.setFavorites(artwork.id + '');
      }
    });
  }
  
   actualizarTotalDePaginas(): void {
    let busqueda = this.buscar ? `${this.api}/search?q=${this.filtro}` : this.api;
    this.artService.getArtWorksAll(busqueda).subscribe((totalPages) => { this.total = totalPages;
    if (this.buscar)
              this.total = this.total >= 100 ? 100 : this.total;
              this.actual = 1; 
    });
  }
}





