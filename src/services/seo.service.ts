import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter, map } from 'rxjs/operators';

const BASE_URL = 'https://annaia.com.br';
const DEFAULT_TITLE = 'Anna.IA - Seu Assistente de Estudos Inteligente';
const DEFAULT_DESCRIPTION = 'Anna.IA é o seu assistente de estudos pessoal que cria planos personalizados, resolve dúvidas e ajuda você a conquistar seus objetivos acadêmicos com inteligência artificial.';
const DEFAULT_KEYWORDS = 'estudos, vestibular, enem, inteligência artificial, plano de estudos, flashcards, educação';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private doc = inject(DOCUMENT);

    constructor() { }

    init() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                return route;
            }),
            filter(route => route.outlet === 'primary'),
        ).subscribe(route => {
            const snapshot = route.snapshot;
            const data = snapshot.data || {};
            // Lê o título da propriedade top-level da rota (title) ou de data.title
            const routeTitle: string | undefined = (snapshot as any).title ?? data['title'];
            this.updateMetaData(data, routeTitle);
        });
    }

    updateMetaData(data: Record<string, any>, routeTitle?: string) {
        const pageTitle = routeTitle ?? data['title'];
        const fullTitle = pageTitle ? `${pageTitle} | Anna.IA` : DEFAULT_TITLE;

        this.titleService.setTitle(fullTitle);
        this.metaService.updateTag({ property: 'og:title', content: fullTitle });
        this.metaService.updateTag({ property: 'twitter:title', content: fullTitle });

        const description: string = data['description'] ?? DEFAULT_DESCRIPTION;
        this.metaService.updateTag({ name: 'description', content: description });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'twitter:description', content: description });

        const keywords: string = data['keywords'] ?? DEFAULT_KEYWORDS;
        this.metaService.updateTag({ name: 'keywords', content: keywords });

        // URL canônica dinâmica por rota
        const pageUrl = BASE_URL + this.router.url.split('?')[0];
        this.metaService.updateTag({ property: 'og:url', content: pageUrl });
        this.metaService.updateTag({ property: 'twitter:url', content: pageUrl });
        this.updateCanonical(pageUrl);

        const robots: string = data['robots'] ?? 'index, follow';
        this.metaService.updateTag({ name: 'robots', content: robots });
    }

    private updateCanonical(url: string): void {
        let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
        if (!link) {
            link = this.doc.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.doc.head.appendChild(link);
        }
        link.setAttribute('href', url);
    }
}
