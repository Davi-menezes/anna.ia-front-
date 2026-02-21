import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';
import { CreditsModalComponent } from './components/credits-modal/credits-modal.component';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, CreditsModalComponent]
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.init();
  }
}
