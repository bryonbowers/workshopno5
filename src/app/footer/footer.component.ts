import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {
    this.initNominationModal();
  }

  private initNominationModal(): void {
    const shouldSuppress = localStorage.getItem('suppress_nomination_modal');
    if (shouldSuppress) return;

    const modal = document.getElementById('nominateModal');
    const suppressBtn = document.getElementById('suppressNominationModal');

    if (!modal || !suppressBtn) return;

    suppressBtn.addEventListener('click', () => {
      localStorage.setItem('suppress_nomination_modal', '1');
      // Use Bootstrap 5's native API to hide modal
      const bsModal = (window as any).bootstrap?.Modal?.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    });
  }
}
