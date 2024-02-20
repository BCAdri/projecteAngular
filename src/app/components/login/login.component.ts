import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {


  email: string = '';
    error: string = '';
  password: string = '';

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService,
    private router : Router,
  ) {}

  async login() {
    if (!this.password || !this.email) {
      this.error = 'Fields cannot be empty.';
      return;
    } else {
      let logged = await this.usersService.login(this.email, this.password);
       if (logged.success){ 
        this.toastr.success('Inicio de sesión exitoso', '¡Bienvenido!')
        .onHidden
        .subscribe(() => {
            this.router.navigate(['profile']);
        });
    }else this.error = logged.message; 
    }
  }
  
}
