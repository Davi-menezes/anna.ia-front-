import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    constructor() { }

    init() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            }),
            filter(route => route.outlet === 'primary'),
            mergeMap(route => route.data)
        ).subscribe(data => {
            this.updateMetaData(data);
        });
    }

    updateMetaData(data: any) {
        if (data.title) {
            this.titleService.setTitle(`${data.title} | Anna.IA`);
        }

        if (data.description) {
            this.metaService.updateTag({ name: 'description', content: data.description });
            this.metaService.updateTag({ property: 'og:description', content: data.description });
            this.metaService.updateTag({ property: 'twitter:description', content: data.description });
        }

        if (data.keywords) {
            this.metaService.updateTag({ name: 'keywords', content: data.keywords });
        }

        // Update OG/Twitter Title
        if (data.title) {
            this.metaService.updateTag({ property: 'og:title', content: `${data.title} | Anna.IA` });
            this.metaService.updateTag({ property: 'twitter:title', content: `${data.title} | Anna.IA` });
        }

        // Canonical URL
        const url = 'https://annaia.com.br' + this.router.url;
        this.metaService.updateTag({ property: 'og:url', content: url });
        this.metaService.updateTag({ property: 'twitter:url', content: url });

        // Manage Robots per page if specified
        if (data.robots) {
            this.metaService.updateTag({ name: 'robots', content: data.robots });
        } else {
            this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        }
    }
}
