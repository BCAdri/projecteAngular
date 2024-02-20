import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    

  constructor(
    private router: Router,
    private usersService: UsersService,
  ) {}
  
  email: string = '';
  error: string = '';
  password: string = '';

  
  async register() {
    if (!this.password || !this.email) {
      this.error = 'Fields cannot be empty.';
      return;
    } else {
      let logged = await this.usersService.register(this.email, this.password);
      if (logged.success) this.router.navigate(['login']);
      else this.error = logged.message;
    }
  }

}
