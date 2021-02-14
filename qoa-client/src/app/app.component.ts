import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isToolbarVisible: boolean;
  title = 'Quality of Air';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService
      .isAuthenticated$
      .subscribe((isAuth: boolean) => {
        this.isToolbarVisible = isAuth;
      });
  }

  onLogout() {
    this.authService.logout();
  }

}
