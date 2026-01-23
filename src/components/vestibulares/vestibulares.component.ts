
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
      description: 'Principal porta de entrada para universidades públicas e privadas no Brasil, utilizando a nota para o Sisu, Prouni e Fies.',
      registrationPeriod: '27 de Maio a 7 de Junho de 2024',
      examDates: ['3 de Novembro de 2024', '10 de Novembro de 2024'],
      officialSiteUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem'
    },
    {
      acronym: 'FUVEST',
      name: 'Fundação Universitária para o Vestibular',
      description: 'Processo seletivo para ingresso na Universidade de São Paulo (USP), um dos mais concorridos e prestigiados do país.',
      registrationPeriod: '19 de Agosto a 8 de Outubro de 2024',
      examDates: ['1ª fase: 17 de Novembro de 2024', '2ª fase: 15 e 16 de Dezembro de 2024'],
      officialSiteUrl: 'https://www.fuvest.br/'
    },
    {
      acronym: 'UNICAMP',
      name: 'Vestibular da Unicamp',
      description: 'Processo seletivo para a Universidade Estadual de Campinas (UNICAMP), conhecido por suas questões interdisciplinares e contextualizadas.',
      registrationPeriod: '1 de Agosto a 3 de Setembro de 2024',
      examDates: ['1ª fase: 20 de Outubro de 2024', '2ª fase: 1 e 2 de Dezembro de 2024'],
      officialSiteUrl: 'https://www.comvest.unicamp.br/'
    },
    {
      acronym: 'FATEC',
      name: 'Vestibular FATEC',
      description: 'Processo seletivo para as Faculdades de Tecnologia do Estado de São Paulo. Foco em cursos tecnológicos de alta qualidade.',
      registrationPeriod: 'Maio a Junho (2º Semestre 2024)',
      examDates: ['30 de Junho de 2024'],
      officialSiteUrl: 'https://www.vestibularfatec.com.br/'
    },
    {
      acronym: 'UNESP',
      name: 'Vestibular UNESP',
      description: 'Processo seletivo para a Universidade Estadual Paulista, uma das maiores e mais importantes universidades do Brasil.',
      registrationPeriod: 'Setembro a Outubro de 2024',
      examDates: ['1ª fase: 15 de Novembro de 2024', '2ª fase: 8 e 9 de Dezembro de 2024'],
      officialSiteUrl: 'https://www.vunesp.com.br/unesp'
    },
    {
      acronym: 'VUNESP',
      name: 'Fundação Vunesp',
      description: 'Organiza vestibulares para diversas instituições, incluindo carreiras militares e prefeituras, além da UNESP.',
      registrationPeriod: 'Variável por edital',
      examDates: ['Consultar edital específico'],
      officialSiteUrl: 'https://www.vunesp.com.br/'
    },
    {
      acronym: 'MACKENZIE',
      name: 'Vestibular Mackenzie',
      description: 'Processo seletivo para a Universidade Presbiteriana Mackenzie, uma das instituições de ensino mais tradicionais de São Paulo.',
      registrationPeriod: 'Abril a Maio (2º Semestre 2024)',
      examDates: ['Junho de 2024'],
      officialSiteUrl: 'https://www.mackenzie.br/processos-seletivos/vestibular-graduacao/'
    },
    {
      acronym: 'PUC',
      name: 'Vestibular PUC',
      description: 'Processo seletivo para as Pontifícias Universidades Católicas, reconhecidas pela excelência acadêmica e humana.',
      registrationPeriod: 'Outubro a Novembro de 2024',
      examDates: ['Dezembro de 2024'],
      officialSiteUrl: 'https://www.pucsp.br/vestibular'
    },
  ]);
}
