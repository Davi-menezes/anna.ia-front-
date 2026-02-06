
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vestibular } from '../../models/vestibular.model';

@Component({
  selector: 'app-vestibulares',
  standalone: true,
  templateUrl: './vestibulares.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class VestibularesComponent {
  vestibulares = signal<Vestibular[]>([
    {
      acronym: 'ENEM',
      name: 'Exame Nacional do Ensino Médio',
      description: 'Principal porta de entrada para universidades públicas e privadas no Brasil.',
      registrationPeriod: 'Maio a Junho de 2026',
      examDates: ['Novembro de 2026'],
      officialSiteUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem'
    },
    {
      acronym: 'FUVEST',
      name: 'Fundação Universitária para o Vestibular',
      description: 'Processo seletivo para ingresso na Universidade de São Paulo (USP).',
      registrationPeriod: 'Agosto a Outubro de 2025 (para 2026)',
      examDates: ['Novembro de 2025', 'Dezembro de 2025'],
      officialSiteUrl: 'https://www.fuvest.br/'
    },
    {
      acronym: 'UNICAMP',
      name: 'Vestibular da Unicamp',
      description: 'Processo seletivo para a Universidade Estadual de Campinas.',
      registrationPeriod: 'Agosto a Setembro de 2025 (para 2026)',
      examDates: ['Outubro de 2025', 'Dezembro de 2025'],
      officialSiteUrl: 'https://www.comvest.unicamp.br/'
    },
    {
      acronym: 'FATEC',
      name: 'Vestibular FATEC',
      description: 'Cursos tecnológicos de alta qualidade nas Faculdades de Tecnologia do Estado de SP.',
      registrationPeriod: 'Maio a Junho de 2026',
      examDates: ['Junho de 2026'],
      officialSiteUrl: 'https://www.vestibularfatec.com.br/'
    },
    {
      acronym: 'UNESP',
      name: 'Vestibular UNESP',
      description: 'Processo seletivo para a Universidade Estadual Paulista.',
      registrationPeriod: 'Setembro a Outubro de 2025 (para 2026)',
      examDates: ['Novembro de 2025', 'Dezembro de 2025'],
      officialSiteUrl: 'https://www.vunesp.com.br/unesp'
    },
    {
      acronym: 'MACKENZIE',
      name: 'Vestibular Mackenzie',
      description: 'Universidade Presbiteriana Mackenzie em São Paulo.',
      registrationPeriod: 'Abril a Maio de 2026',
      examDates: ['Junho de 2026'],
      officialSiteUrl: 'https://www.mackenzie.br/processos-seletivos/vestibular-graduacao/'
    },
    {
      acronym: 'PUC',
      name: 'Vestibular PUC',
      description: 'Pontifícias Universidades Católicas.',
      registrationPeriod: 'Outubro a Novembro de 2025 (para 2026)',
      examDates: ['Dezembro de 2025'],
      officialSiteUrl: 'https://www.pucsp.br/vestibular'
    },
  ]);
}
