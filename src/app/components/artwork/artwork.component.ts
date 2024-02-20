import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { IArtwork } from '../../interfaces/i-artwork';
import { ApiServiceService } from '../../services/api-service.service';

@Component({
  selector: 'app-artwork',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artwork.component.html',
  styleUrl: './artwork.component.css',
})
export class ArtworkComponent implements OnInit {
  constructor(
    private router: ActivatedRoute,
    private apiService: ApiServiceService,
  ) {}
  ngOnInit(): void {
    this.router.paramMap.subscribe(params => this.handleRouteParams(params));
  }

  private handleRouteParams(params: ParamMap): void {
    const id = params.get('id');
    if (id) {
      this.LoadArtwork(id);
    }
  }
  private LoadArtwork(id: string): void {
    this.loadArtwork([id]);
  }
  private loadArtwork(ids: string[]): void {
    this.apiService.getArtworksFromIDs(ids).subscribe(
      artworks => {
        this.artwork = artworks[0];
        console.log(this.artwork);
      },
      error => {
        console.error('Error al cargar el arte', error);
      }
    );
  }

  showFullDescription = false;
  mouseover: boolean = false;
  @Input() artwork!: IArtwork;
  @Input() id?: string;
  
  @Output() likeChanged = new EventEmitter<boolean>();
  
  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }
  toggleLike() {
    this.likeChanged.emit(this.artwork.like);
  }
 
}
