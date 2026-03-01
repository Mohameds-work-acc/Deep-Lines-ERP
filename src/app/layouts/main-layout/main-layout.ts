import { Component } from '@angular/core';
import { SidebarComponant } from "../../componants/sidebar-componant/sidebar-componant";
import { RouterOutlet } from "@angular/router";
import { NavbarComponant } from "../../componants/navbar-componant/navbar-componant";

@Component({
  selector: 'app-main-layout',
  imports: [SidebarComponant, RouterOutlet, NavbarComponant],
  templateUrl: './main-layout.html',
})
export class MainLayout {

}
