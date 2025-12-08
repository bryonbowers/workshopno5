import { Component } from '@angular/core';
@Component({
  selector: 'app-navigation-component',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  
  openNav():void {
    document.getElementById("mySidenav").style.width = "250px";
}

 closeNav():void {
    document.getElementById("mySidenav").style.width = "0";
}


}
