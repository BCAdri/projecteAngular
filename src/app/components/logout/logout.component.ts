import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  constructor(private userService: UsersService,
    private toastr: ToastrService,
    private router : Router,
    ) {}

  ngOnInit() {
    this.logout();
  }

  logout() {
    this.userService.logout();
    this.toastr.success('', '')
    .onHidden
    .subscribe(() => {
        this.router.navigate(['register']);
    });
  }
}