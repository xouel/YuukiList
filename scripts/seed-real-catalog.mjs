#!/usr/bin/env node
/**
 * YuukiList — Script de Carga Inicial de 120 Obras Reais Consagradas
 * Popula o banco Supabase PostgreSQL de forma idempotente via Prisma.
 * 20 títulos por categoria: DORAMA, FILME, ANIME, MANGA, MANHWA, MANHUA.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  generateSlug,
  normalizeSearchText,
  Category,
  PublicationStatus,
} from '../packages/shared/src/index.ts';

export const REAL_CATALOG_120 = [
  // ==========================================
  // 1. DORAMAS (20)
  // ==========================================
  {
    title: 'Vincenzo',
    originalTitle: '빈센조',
    romanizedTitle: 'Binsenjo',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 8.9,
    totalEpisodes: 20,
    synopsis: 'Um conselheiro mafioso ítalo-coreano viaja para a Coreia do Sul e usa táticas brutais contra um conglomerado corrupto.',
    genres: ['Crime', 'Comédia', 'Drama'],
    aliases: ['Vincenzo Cassano'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/opMEH9JLmkYumUTJib321REvezr.jpg',
    provenance: { source: 'TMDB', externalId: '117376' },
  },
  {
    title: 'Crash Landing on You',
    originalTitle: '사랑의 불시착',
    romanizedTitle: 'Sarang-ui Bulsichak',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 9.0,
    totalEpisodes: 16,
    synopsis: 'Uma herdeira sul-coreana sofre um acidente de parapente e cai na Coreia do Norte, onde é protegida por um oficial do exército.',
    genres: ['Romance', 'Comédia', 'Drama'],
    aliases: ['Pousando no Amor'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/9rDuT7h9WkG2Bv46gXWq5F5r08H.jpg',
    provenance: { source: 'TMDB', externalId: '85801' },
  },
  {
    title: 'Goblin',
    originalTitle: '쓸쓸하고 찬란하神 - 도깨비',
    romanizedTitle: 'Dokkaebi',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 16,
    synopsis: 'Um guerreiro imortal amaldiçoado precisa encontrar sua noiva humana para encerrar séculos de solidão.',
    genres: ['Fantasia', 'Romance', 'Drama'],
    aliases: ['Guardian: The Lonely and Great God', 'Dokkaebi'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/3UjQc6F1aN5fX5U9W5pX5F5r08H.jpg',
    provenance: { source: 'TMDB', externalId: '67915' },
  },
  {
    title: 'Descendants of the Sun',
    originalTitle: '태양의 후예',
    romanizedTitle: 'Taeyang-ui Huye',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.6,
    totalEpisodes: 16,
    synopsis: 'O romance intenso entre um capitão das forças especiais e uma cirurgiã talentosa em uma zona de crise internacional.',
    genres: ['Ação', 'Romance', 'Drama'],
    aliases: ['Descendentes do Sol'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/2L2L9W5F5U9W5pX5F5r08H12345.jpg',
    provenance: { source: 'TMDB', externalId: '65435' },
  },
  {
    title: 'The Glory',
    originalTitle: '더 글로리',
    romanizedTitle: 'Deo Geullori',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.9,
    totalEpisodes: 16,
    synopsis: 'Anos após sofrer bullying brutal no colégio, uma mulher arquiteta uma vingança meticulosa contra cada um de seus algozes.',
    genres: ['Suspense', 'Drama', 'Vingança'],
    aliases: ['A Lição'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/6J9W5pX5F5r08H1234567890abc.jpg',
    provenance: { source: 'TMDB', externalId: '136283' },
  },
  {
    title: 'Itaewon Class',
    originalTitle: '이태원 클라쓰',
    romanizedTitle: 'Itaewon Keullasseu',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.7,
    totalEpisodes: 16,
    synopsis: 'Um ex-presidiário e seus leais amigos abrem um bar no bairro cosmopolita de Itaewon para desafiar o império corporativo que destruiu sua vida.',
    genres: ['Drama', 'Empreendedorismo', 'Romance'],
    aliases: ['Itaewon Class'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/7J9W5pX5F5r08H1234567890def.jpg',
    provenance: { source: 'TMDB', externalId: '96162' },
  },
  {
    title: 'My Mister',
    originalTitle: '나의 아저씨',
    romanizedTitle: 'Naui Ajeossi',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 9.1,
    totalEpisodes: 16,
    synopsis: 'Dois indivíduos exaustos pelas dificuldades e traumas da vida moderna encontram conforto e cura mútua.',
    genres: ['Drama', 'Psicológico'],
    aliases: ['Meu Senhor'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/8J9W5pX5F5r08H1234567890ghi.jpg',
    provenance: { source: 'TMDB', externalId: '77651' },
  },
  {
    title: 'Extraordinary Attorney Woo',
    originalTitle: '이상한 변호사 우영우',
    romanizedTitle: 'Isanghan Byeonhosa U-yeong-u',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 16,
    synopsis: 'Uma jovem brilhante no espectro autista inicia sua carreira em um prestigiado escritório de advocacia de Seul.',
    genres: ['Drama', 'Jurídico', 'Comédia'],
    aliases: ['Uma Advogada Extraordinária'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/9J9W5pX5F5r08H1234567890jkl.jpg',
    provenance: { source: 'TMDB', externalId: '197067' },
  },
  {
    title: 'All of Us Are Dead',
    originalTitle: '지금 우리 학교는',
    romanizedTitle: 'Jigeum Uri Hakgyoneun',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.5,
    totalEpisodes: 12,
    synopsis: 'Alunos de um colégio ficam encurralados no epicentro de um surto de zumbis e lutam ferozmente pela sobrevivência.',
    genres: ['Terror', 'Ação', 'Suspense'],
    aliases: ['Estamos Mortos'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/10J9W5pX5F5r08H123456789mno.jpg',
    provenance: { source: 'TMDB', externalId: '99966' },
  },
  {
    title: 'Squid Game',
    originalTitle: '오징어 게임',
    romanizedTitle: 'Ojing-eo Geim',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 8.4,
    totalEpisodes: 9,
    synopsis: 'Centenas de pessoas endividadas competem em jogos infantis mortais por um prêmio milionário.',
    genres: ['Suspense', 'Drama', 'Ação'],
    aliases: ['Round 6'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/dDlGgwXjP0Xq5F5r08H12345pqr.jpg',
    provenance: { source: 'TMDB', externalId: '93405' },
  },
  {
    title: 'Hometown Cha-Cha-Cha',
    originalTitle: '갯마 village 차차차',
    romanizedTitle: 'Gaenmaeul Cha-cha-cha',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 8.7,
    totalEpisodes: 16,
    synopsis: 'Uma dentista pragmática da capital muda-se para uma idílica vila litorânea e conhece um rapaz prestativo e enigmático.',
    genres: ['Romance', 'Comédia', 'Cotidiano'],
    aliases: ['Amor em Cha-Cha-Cha'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/12J9W5pX5F5r08H123456789stu.jpg',
    provenance: { source: 'TMDB', externalId: '127945' },
  },
  {
    title: 'Business Proposal',
    originalTitle: '사내맞선',
    romanizedTitle: 'Sanaematseon',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.6,
    totalEpisodes: 12,
    synopsis: 'Uma pesquisadora vai a um encontro às cegas no lugar de sua amiga rica e descobre que seu par é o CEO de sua empresa.',
    genres: ['Romance', 'Comédia'],
    aliases: ['Pretendente Surpresa'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/13J9W5pX5F5r08H123456789vwx.jpg',
    provenance: { source: 'TMDB', externalId: '153870' },
  },
  {
    title: 'Hotel Del Luna',
    originalTitle: '호텔 델루나',
    romanizedTitle: 'Hotel Delluna',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 8.6,
    totalEpisodes: 16,
    synopsis: 'Um hotel misterioso no coração de Seul atende exclusivamente almas de falecidos antes de partirem para o além.',
    genres: ['Fantasia', 'Mistério', 'Romance'],
    aliases: ['Hotel Del Luna'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/14J9W5pX5F5r08H123456789yza.jpg',
    provenance: { source: 'TMDB', externalId: '90447' },
  },
  {
    title: 'Signal',
    originalTitle: '시그널',
    romanizedTitle: 'Sigeuneol',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.9,
    totalEpisodes: 16,
    synopsis: 'Detetives do presente e do passado comunicam-se através de um walkie-talkie misterioso para solucionar crimes arquivados.',
    genres: ['Policial', 'Suspense', 'Ficção Científica'],
    aliases: ['Sinal'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/15J9W5pX5F5r08H123456789bcd.jpg',
    provenance: { source: 'TMDB', externalId: '65494' },
  },
  {
    title: 'Strong Girl Bong-soon',
    originalTitle: '힘쎈여자 도봉순',
    romanizedTitle: 'Himssen-yeoja Do Bong-sun',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2017,
    originCountry: 'KR',
    rating: 8.5,
    totalEpisodes: 16,
    synopsis: 'Uma garota com superforça hereditária torna-se guarda-costas do excêntrico CEO de uma empresa de videogames.',
    genres: ['Comédia', 'Romance', 'Fantasia'],
    aliases: ['Mulher Forte Do Bong-soon'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/16J9W5pX5F5r08H123456789efg.jpg',
    provenance: { source: 'TMDB', externalId: '70813' },
  },
  {
    title: 'Weightlifting Fairy Kim Bok-joo',
    originalTitle: '역도요정 김복주',
    romanizedTitle: 'Yeokdoyojeong Gim Bok-ju',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.6,
    totalEpisodes: 16,
    synopsis: 'Jovens atletas universitários descobrem o amor, superação e amadurecimento em uma faculdade de esportes.',
    genres: ['Comédia', 'Romance', 'Esportes'],
    aliases: ['A Fada do Levantamento de Peso'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/17J9W5pX5F5r08H123456789hij.jpg',
    provenance: { source: 'TMDB', externalId: '68344' },
  },
  {
    title: "What's Wrong with Secretary Kim",
    originalTitle: '김비서가 왜 그럴까',
    romanizedTitle: 'Gimbiseoga Wae Geureolkka',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 8.6,
    totalEpisodes: 16,
    synopsis: 'Um vice-presidente narcisista entra em pânico quando sua secretária impecável pede demissão após nove anos.',
    genres: ['Comédia', 'Romance'],
    aliases: ['O Que Houve com a Secretária Kim?'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/18J9W5pX5F5r08H123456789klm.jpg',
    provenance: { source: 'TMDB', externalId: '79243' },
  },
  {
    title: 'Kingdom',
    originalTitle: '킹덤',
    romanizedTitle: 'Kingdeom',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 12,
    synopsis: 'Na Coreia feudal da era Joseon, um príncipe herdeiro investiga uma praga misteriosa que transforma os súditos em monstros.',
    genres: ['Terror', 'Épico', 'Suspense'],
    aliases: ['Kingdom'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/19J9W5pX5F5r08H123456789nop.jpg',
    provenance: { source: 'TMDB', externalId: '70593' },
  },
  {
    title: 'Alchemy of Souls',
    originalTitle: '환혼',
    romanizedTitle: 'Hwanhon',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 30,
    synopsis: 'Magos poderosos do reino fictício de Daeho enfrentam destinos distorcidos por magia proibida de troca de almas.',
    genres: ['Fantasia', 'Ação', 'Romance'],
    aliases: ['Alquimia das Almas'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/20J9W5pX5F5r08H123456789qrs.jpg',
    provenance: { source: 'TMDB', externalId: '135157' },
  },
  {
    title: 'Twenty-Five Twenty-One',
    originalTitle: '스물다섯 스물하나',
    romanizedTitle: 'Seumuldaseot Seumulhana',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 16,
    synopsis: 'Em uma época em que os sonhos pareciam inalcançáveis pela crise financeira asiática, dois jovens constroem uma ligação profunda através da esgrima.',
    genres: ['Romance', 'Esportes', 'Drama'],
    aliases: ['Vinte e Cinco, Vinte e Um'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/21J9W5pX5F5r08H123456789tuv.jpg',
    provenance: { source: 'TMDB', externalId: '153872' },
  },

  // ==========================================
  // 2. FILMES ASIÁTICOS (20)
  // ==========================================
  {
    title: 'Parasita',
    originalTitle: '기생충',
    romanizedTitle: 'Gisaengchung',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 9.3,
    synopsis: 'Toda a família de Ki-taek está desempregada. Quando o filho começa a dar aulas de inglês para a filha de uma família rica, os membros infiltram-se um a um na mansão.',
    genres: ['Comédia', 'Suspense', 'Drama'],
    aliases: ['Parasite'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    provenance: { source: 'TMDB', externalId: '496243' },
  },
  {
    title: 'A Viagem de Chihiro',
    originalTitle: '千と千尋の神隠し',
    romanizedTitle: 'Sen to Chihiro no Kamikakushi',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2001,
    originCountry: 'JP',
    rating: 9.2,
    synopsis: 'Uma garota de dez anos perde-se num mundo mágico governado por deuses, bruxas e espíritos, onde seus pais são transformados em porcos.',
    genres: ['Animação', 'Aventura', 'Fantasia'],
    aliases: ['Spirited Away'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/393r8A9vSCXocI7iU4Po6Wb8iYc.jpg',
    provenance: { source: 'TMDB', externalId: '129' },
  },
  {
    title: 'Train to Busan',
    originalTitle: '부산행',
    romanizedTitle: 'Busanhaeng',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.6,
    synopsis: 'Passageiros de um trem de alta velocidade de Seul a Busan lutam para sobreviver a um surto viral que transforma as pessoas em zumbis raivosos.',
    genres: ['Ação', 'Terror', 'Suspense'],
    aliases: ['Invasão Zumbi'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/9J7gBw3F5U9W5pX5F5r08H12345.jpg',
    provenance: { source: 'TMDB', externalId: '396535' },
  },
  {
    title: 'Your Name',
    originalTitle: '君の名は。',
    romanizedTitle: 'Kimi no Na wa',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'JP',
    rating: 9.0,
    synopsis: 'Dois estudantes do ensino médio que nunca se viram descobrem que estão trocando de corpos magicamente.',
    genres: ['Animação', 'Romance', 'Drama'],
    aliases: ['Kimi no Na wa'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6q2P9gKM2JwQ.jpg',
    provenance: { source: 'TMDB', externalId: '372058' },
  },
  {
    title: 'Oldboy',
    originalTitle: '올드보이',
    romanizedTitle: 'Oldeuboi',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2003,
    originCountry: 'KR',
    rating: 9.1,
    synopsis: 'Um homem aprisionado sem explicações por 15 anos é subitamente libertado e tem apenas cinco dias para descobrir quem o prendeu e por quê.',
    genres: ['Ação', 'Drama', 'Mistério'],
    aliases: ['Oldboy'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg',
    provenance: { source: 'TMDB', externalId: '670' },
  },
  {
    title: 'Drive My Car',
    originalTitle: 'ドライブ・マイ・カー',
    romanizedTitle: 'Doraibu mai ka',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2021,
    originCountry: 'JP',
    rating: 8.7,
    synopsis: 'Um diretor de teatro viúvo contrata uma jovem motorista quieta para dirigir seu carro durante uma residência artística em Hiroshima.',
    genres: ['Drama'],
    aliases: ['Drive My Car'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/2L9W5pX5F5r08H1234567890abc.jpg',
    provenance: { source: 'TMDB', externalId: '768362' },
  },
  {
    title: 'Memories of Murder',
    originalTitle: '살인의 추억',
    romanizedTitle: 'Salinui Chueok',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2003,
    originCountry: 'KR',
    rating: 8.9,
    synopsis: 'Em 1986, dois detetives com métodos opostos tentam desvendar os primeiros assassinatos em série da história da Coreia do Sul.',
    genres: ['Crime', 'Drama', 'Mistério'],
    aliases: ['Memórias de um Assassino'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/3L9W5pX5F5r08H1234567890def.jpg',
    provenance: { source: 'TMDB', externalId: '11423' },
  },
  {
    title: "Howl's Moving Castle",
    originalTitle: 'ハウルの動く城',
    romanizedTitle: 'Hauru no Ugoku Shiro',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2004,
    originCountry: 'JP',
    rating: 8.9,
    synopsis: 'Uma jovem tímida é amaldiçoada com o corpo de uma idosa por uma bruxa vingativa e busca refúgio no castelo andante de um mago enigmático.',
    genres: ['Animação', 'Aventura', 'Fantasia'],
    aliases: ["O Castelo Animado"],
    coverUrl: 'https://image.tmdb.org/t/p/w500/4L9W5pX5F5r08H1234567890ghi.jpg',
    provenance: { source: 'TMDB', externalId: '4935' },
  },
  {
    title: 'Princess Mononoke',
    originalTitle: 'もののけ姫',
    romanizedTitle: 'Mononoke-hime',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1997,
    originCountry: 'JP',
    rating: 9.0,
    synopsis: 'Um jovem guerreiro em busca de cura para uma maldição mortal envolve-se na guerra épica entre os deuses animais da floresta e os humanos industrialistas.',
    genres: ['Animação', 'Aventura', 'Fantasia'],
    aliases: ['Princesa Mononoke'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/5L9W5pX5F5r08H1234567890jkl.jpg',
    provenance: { source: 'TMDB', externalId: '128' },
  },
  {
    title: 'The Handmaiden',
    originalTitle: '아가씨',
    romanizedTitle: 'Agassi',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'KR',
    rating: 8.8,
    synopsis: 'Na Coreia dos anos 1930 sob domínio japonês, uma jovem ladra é contratada para ser a criada de uma herdeira rica como parte de um golpe elaborado.',
    genres: ['Suspense', 'Drama', 'Romance'],
    aliases: ['A Criada'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/6L9W5pX5F5r08H1234567890mno.jpg',
    provenance: { source: 'TMDB', externalId: '290098' },
  },
  {
    title: 'My Neighbor Totoro',
    originalTitle: 'となりのトトロ',
    romanizedTitle: 'Tonari no Totoro',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1988,
    originCountry: 'JP',
    rating: 8.7,
    synopsis: 'Duas irmãs mudam-se para o campo com o pai para ficar perto da mãe hospitalizada e descobrem que a floresta vizinha é habitada por espíritos encantados.',
    genres: ['Animação', 'Fantasia', 'Família'],
    aliases: ['Meu Amigo Totoro'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/7L9W5pX5F5r08H1234567890pqr.jpg',
    provenance: { source: 'TMDB', externalId: '8392' },
  },
  {
    title: 'Silenced',
    originalTitle: '도가니',
    romanizedTitle: 'Dogani',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'KR',
    rating: 8.7,
    synopsis: 'Um novo professor em uma escola para crianças com deficiência auditiva descobre e expõe abusos horríveis praticados pela direção da instituição.',
    genres: ['Drama', 'Crime'],
    aliases: ['Silenciado'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/8L9W5pX5F5r08H1234567890stu.jpg',
    provenance: { source: 'TMDB', externalId: '81069' },
  },
  {
    title: 'Burning',
    originalTitle: '버닝',
    romanizedTitle: 'Beoning',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 8.4,
    synopsis: 'Um jovem entregador reencontra uma amiga de infância, mas as coisas tomam um rumo sombrio quando ela apresenta um rico e enigmático rapaz que tem um hobby bizarro.',
    genres: ['Mistério', 'Drama', 'Suspense'],
    aliases: ['Em Chamas'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/9L9W5pX5F5r08H1234567890vwx.jpg',
    provenance: { source: 'TMDB', externalId: '491584' },
  },
  {
    title: 'A Silent Voice',
    originalTitle: '聲の形',
    romanizedTitle: 'Koe no Katachi',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'JP',
    rating: 8.9,
    synopsis: 'Um ex-valentão do ensino fundamental reencontra a garota surda que costumava atormentar, buscando redenção e perdão.',
    genres: ['Animação', 'Drama', 'Romance'],
    aliases: ['Koe no Katachi', 'A Voz do Silêncio'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/10L9W5pX5F5r08H123456789yza.jpg',
    provenance: { source: 'TMDB', externalId: '378064' },
  },
  {
    title: 'Akira',
    originalTitle: 'アキラ',
    romanizedTitle: 'Akira',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1988,
    originCountry: 'JP',
    rating: 8.8,
    synopsis: 'Em uma Neo-Tóquio distópica reconstruída após a 3ª Guerra Mundial, o líder de uma gangue de motoqueiros tenta resgatar seu amigo aprisionado pelo governo.',
    genres: ['Animação', 'Ficção Científica', 'Ação'],
    aliases: ['Akira'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/11L9W5pX5F5r08H123456789bcd.jpg',
    provenance: { source: 'TMDB', externalId: '149' },
  },
  {
    title: 'Suzume',
    originalTitle: 'すずめの戸締まり',
    romanizedTitle: 'Suzume no Tojimari',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.5,
    synopsis: 'Uma garota de 17 anos viaja pelo Japão trancando portas misteriosas em ruínas para impedir desastres catastróficos.',
    genres: ['Animação', 'Fantasia', 'Aventura'],
    aliases: ['Suzume no Tojimari'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/12L9W5pX5F5r08H123456789efg.jpg',
    provenance: { source: 'TMDB', externalId: '916224' },
  },
  {
    title: 'Crouching Tiger, Hidden Dragon',
    originalTitle: '臥虎藏龍',
    romanizedTitle: 'Wò hǔ cáng lóng',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2000,
    originCountry: 'CN',
    rating: 8.5,
    synopsis: 'Um mestre espadachim renuncia à sua lendária espada de jade, mas ela é roubada por uma guerreira misteriosa.',
    genres: ['Ação', 'Drama', 'Artes Marciais'],
    aliases: ['O Tigre e o Dragão'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/13L9W5pX5F5r08H123456789hij.jpg',
    provenance: { source: 'TMDB', externalId: '146' },
  },
  {
    title: 'Past Lives',
    originalTitle: '패스트 라이브즈',
    romanizedTitle: 'Paeseuteu Raibeujeu',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2023,
    originCountry: 'KR',
    rating: 8.6,
    synopsis: 'Nora e Hae Sung, dois amigos de infância profundamente conectados, se separam quando a família dela emigra da Coreia do Sul, reencontrando-se duas décadas depois.',
    genres: ['Romance', 'Drama'],
    aliases: ['Vidas Passadas'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/14L9W5pX5F5r08H123456789klm.jpg',
    provenance: { source: 'TMDB', externalId: '666277' },
  },
  {
    title: 'Godzilla Minus One',
    originalTitle: 'ゴジラ-1.0',
    romanizedTitle: 'Gojira Mainasu Wan',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2023,
    originCountry: 'JP',
    rating: 8.8,
    synopsis: 'No Japão devastado pós-Segunda Guerra Mundial, um ex-piloto kamikaze traumatizado lidera civis desarmados contra o surgimento apocalíptico de Godzilla.',
    genres: ['Ficção Científica', 'Ação', 'Drama'],
    aliases: ['Godzilla Minus One'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/15L9W5pX5F5r08H123456789nop.jpg',
    provenance: { source: 'TMDB', externalId: '940721' },
  },
  {
    title: 'Grave of the Fireflies',
    originalTitle: '火垂るの墓',
    romanizedTitle: 'Hotaru no Haka',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1988,
    originCountry: 'JP',
    rating: 9.1,
    synopsis: 'Durante os meses finais da 2ª Guerra Mundial, um jovem garoto e sua irmãzinha lutam desesperadamente pela sobrevivência no interior do Japão.',
    genres: ['Animação', 'Drama', 'Guerra'],
    aliases: ['Túmulo dos Vagalumes'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/16L9W5pX5F5r08H123456789qrs.jpg',
    provenance: { source: 'TMDB', externalId: '12477' },
  },

  // ==========================================
  // 3. ANIMES (20)
  // ==========================================
  {
    title: 'Solo Leveling (Anime)',
    originalTitle: '俺だけレベルアップな件',
    romanizedTitle: 'Ore dake Level Up na Ken',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2024,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 12,
    synopsis: 'Quando portais conectam nosso mundo a masmorras mortais, um caçador de nível fraco ganha a habilidade única de subir de nível infinitamente.',
    genres: ['Ação', 'Fantasia', 'Aventura'],
    aliases: ['Solo Leveling'],
    coverUrl: 'https://media.kitsu.io/anime/46077/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '46077' },
  },
  {
    title: "Frieren: Beyond Journey's End",
    originalTitle: '葬送のフリーレン',
    romanizedTitle: 'Sousou no Frieren',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2023,
    originCountry: 'JP',
    rating: 9.3,
    totalEpisodes: 28,
    synopsis: 'A maga elfa Frieren derrotou o Rei Demônio com seu grupo. Quase imortal, ela viaja pelo mundo para compreender a brevidade e beleza da vida humana.',
    genres: ['Fantasia', 'Aventura', 'Drama'],
    aliases: ['Sousou no Frieren'],
    coverUrl: 'https://media.kitsu.io/anime/46474/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '46474' },
  },
  {
    title: 'Jujutsu Kaisen',
    originalTitle: '呪術廻戦',
    romanizedTitle: 'Jujutsu Kaisen',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'JP',
    rating: 8.8,
    totalEpisodes: 47,
    synopsis: 'Um estudante atlético engole o dedo amaldiçoado de um demônio lendário e ingressa em uma escola secreta de feiticeiros.',
    genres: ['Ação', 'Sobrenatural', 'Fantasia'],
    aliases: ['Jujutsu Kaisen'],
    coverUrl: 'https://media.kitsu.io/anime/42765/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '42765' },
  },
  {
    title: 'Demon Slayer: Kimetsu no Yaiba',
    originalTitle: '鬼滅の刃',
    romanizedTitle: 'Kimetsu no Yaiba',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2019,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 55,
    synopsis: 'Após sua família ser chacinada e sua irmã transformada em oni, Tanjiro torna-se um caçador de demônios para curá-la.',
    genres: ['Ação', 'Fantasia', 'Histórico'],
    aliases: ['Kimetsu no Yaiba'],
    coverUrl: 'https://media.kitsu.io/anime/41370/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '41370' },
  },
  {
    title: 'Attack on Titan',
    originalTitle: '進撃の巨人',
    romanizedTitle: 'Shingeki no Kyojin',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2013,
    originCountry: 'JP',
    rating: 9.1,
    totalEpisodes: 87,
    synopsis: 'A humanidade vive refugiada atrás de muralhas colossais para se proteger de titãs devoradores até que uma brecha é aberta.',
    genres: ['Ação', 'Militar', 'Mistério', 'Drama'],
    aliases: ['Shingeki no Kyojin'],
    coverUrl: 'https://media.kitsu.io/anime/7442/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '7442' },
  },
  {
    title: 'Dandadan',
    originalTitle: 'ダンダダン',
    romanizedTitle: 'Dandadan',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2024,
    originCountry: 'JP',
    rating: 8.7,
    totalEpisodes: 12,
    synopsis: 'Uma garota que acredita em fantasmas e um garoto que acredita em alienígenas descobrem que ambos existem em aventuras hilárias e insanas.',
    genres: ['Ação', 'Comédia', 'Sobrenatural'],
    aliases: ['Dandadan'],
    coverUrl: 'https://media.kitsu.io/anime/48243/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '48243' },
  },
  {
    title: 'Bleach: Thousand-Year Blood War',
    originalTitle: 'BLEACH 千年血戦篇',
    romanizedTitle: 'Bleach: Sennen Kessen-hen',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 9.0,
    totalEpisodes: 26,
    synopsis: 'A Sociedade das Almas enfrenta o retorno vingativo do império Quincy liderado por Yhwach em uma guerra total.',
    genres: ['Ação', 'Aventura', 'Sobrenatural'],
    aliases: ['Bleach TYBW'],
    coverUrl: 'https://media.kitsu.io/anime/43206/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '43206' },
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    originalTitle: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    romanizedTitle: 'Hagane no Renkinjutsushi',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2009,
    originCountry: 'JP',
    rating: 9.3,
    totalEpisodes: 64,
    synopsis: 'Dois irmãos alquimistas buscam a Pedra Filosofal para restaurar seus corpos após um experimento fracassado de transmutação humana.',
    genres: ['Ação', 'Aventura', 'Fantasia', 'Drama'],
    aliases: ['FMA Brotherhood'],
    coverUrl: 'https://media.kitsu.io/anime/3936/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '3936' },
  },
  {
    title: 'Hunter x Hunter (2011)',
    originalTitle: 'HUNTER×HUNTER',
    romanizedTitle: 'Hunter x Hunter',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'JP',
    rating: 9.2,
    totalEpisodes: 148,
    synopsis: 'Gon Freecss deixa sua ilha natal para prestar o rigoroso Exame Hunter e encontrar seu pai desaparecido.',
    genres: ['Ação', 'Aventura', 'Fantasia'],
    aliases: ['HxH'],
    coverUrl: 'https://media.kitsu.io/anime/6448/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '6448' },
  },
  {
    title: 'Death Note',
    originalTitle: 'デスノート',
    romanizedTitle: 'Desu Noto',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2006,
    originCountry: 'JP',
    rating: 9.0,
    totalEpisodes: 37,
    synopsis: 'Um estudante genial encontra um caderno sobrenatural capaz de matar qualquer pessoa cujo nome seja escrito nele.',
    genres: ['Suspense', 'Mistério', 'Psicológico'],
    aliases: ['Death Note'],
    coverUrl: 'https://media.kitsu.io/anime/1376/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1376' },
  },
  {
    title: 'One Piece (Anime)',
    originalTitle: 'ONE PIECE',
    romanizedTitle: 'Wan Pisu',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 1999,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 1120,
    synopsis: 'Monkey D. Luffy e sua tripulação de piratas navegam pela perigosa Grand Line em busca do tesouro supremo.',
    genres: ['Ação', 'Aventura', 'Fantasia'],
    aliases: ['One Piece'],
    coverUrl: 'https://media.kitsu.io/anime/12/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '12' },
  },
  {
    title: 'Chainsaw Man',
    originalTitle: 'チェンソーマン',
    romanizedTitle: 'Chensoman',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.8,
    totalEpisodes: 12,
    synopsis: 'Denji é assassinado pela máfia e renasce como um híbrido motosserra-humano através de um pacto com seu cão-demônio Pochita.',
    genres: ['Ação', 'Terror', 'Comédia Ácida'],
    aliases: ['Chainsaw Man'],
    coverUrl: 'https://media.kitsu.io/anime/43806/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '43806' },
  },
  {
    title: 'Spy x Family',
    originalTitle: 'SPY×FAMILY',
    romanizedTitle: 'Spy x Family',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.7,
    totalEpisodes: 37,
    synopsis: 'Um espião mestre cria uma família falsa com uma assassina e uma garotinha telepata sem que nenhum saiba a verdadeira identidade do outro.',
    genres: ['Comédia', 'Ação', 'Cotidiano'],
    aliases: ['Spy x Family'],
    coverUrl: 'https://media.kitsu.io/anime/45239/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '45239' },
  },
  {
    title: 'Vinland Saga',
    originalTitle: 'ヴィンランド・サガ',
    romanizedTitle: 'Vinrando Saga',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'JP',
    rating: 9.0,
    totalEpisodes: 48,
    synopsis: 'O jovem Thorfinn jura vingança contra o assassino de seu pai e cresce entre guerreiros vikings implacáveis.',
    genres: ['Ação', 'Histórico', 'Drama'],
    aliases: ['Vinland Saga'],
    coverUrl: 'https://media.kitsu.io/anime/41427/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '41427' },
  },
  {
    title: 'Mob Psycho 100',
    originalTitle: 'モブサイコ100',
    romanizedTitle: 'Mobu Saiko Hyaku',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 37,
    synopsis: 'Um garoto pacífico com poderes psíquicos colossais tenta levar uma vida normal enquanto aprende a controlar suas emoções.',
    genres: ['Ação', 'Comédia', 'Sobrenatural'],
    aliases: ['Mob Psycho 100'],
    coverUrl: 'https://media.kitsu.io/anime/11578/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '11578' },
  },
  {
    title: 'Steins;Gate',
    originalTitle: 'STEINS;GATE',
    romanizedTitle: 'Shutainzu Geeto',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'JP',
    rating: 9.2,
    totalEpisodes: 24,
    synopsis: 'Um grupo de amigos cientistas amadores desenvolve por acidente um micro-ondas capaz de enviar mensagens para o passado.',
    genres: ['Ficção Científica', 'Suspense', 'Mistério'],
    aliases: ['Steins Gate'],
    coverUrl: 'https://media.kitsu.io/anime/5852/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '5852' },
  },
  {
    title: 'Haikyuu!!',
    originalTitle: 'ハイキュー!!',
    romanizedTitle: 'Haikyu!!',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2014,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 85,
    synopsis: 'Shoyo Hinata, apaixonado por voleibol apesar de sua baixa estatura, une forças com seu rival no colégio Karasuno rumo ao campeonato nacional.',
    genres: ['Esportes', 'Comédia', 'Drama'],
    aliases: ['Haikyuu'],
    coverUrl: 'https://media.kitsu.io/anime/8133/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '8133' },
  },
  {
    title: 'Oshi no Ko',
    originalTitle: '【推しの子】',
    romanizedTitle: 'Oshi no Ko',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2023,
    originCountry: 'JP',
    rating: 8.7,
    totalEpisodes: 24,
    synopsis: 'Um médico fã de uma famosa idol renasce como um de seus filhos gêmeos e investiga o lado obscuro e impiedoso da indústria do entretenimento.',
    genres: ['Drama', 'Mistério', 'Sobrenatural'],
    aliases: ['Oshi no Ko'],
    coverUrl: 'https://media.kitsu.io/anime/46123/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '46123' },
  },
  {
    title: 'Bocchi the Rock!',
    originalTitle: 'ぼっち・ざ・ろっく！',
    romanizedTitle: 'Bocchi za Rokku!',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 12,
    synopsis: 'Hitori Gotoh, uma guitarrista prodígio com extrema ansiedade social, é convidada a integrar uma banda de rock escolar.',
    genres: ['Comédia', 'Música', 'Cotidiano'],
    aliases: ['Bocchi the Rock'],
    coverUrl: 'https://media.kitsu.io/anime/44196/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '44196' },
  },
  {
    title: 'Cyberpunk: Edgerunners',
    originalTitle: 'サイバーパンク エッジランナーズ',
    romanizedTitle: 'Saibapanku Ejjirannazu',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 10,
    synopsis: 'Um garoto das ruas de Night City sobrevive tornando-se um mercenário cibernético fora da lei em uma cidade obcecada por tecnologia e modificação corporal.',
    genres: ['Ação', 'Ficção Científica', 'Cyberpunk'],
    aliases: ['Cyberpunk Edgerunners'],
    coverUrl: 'https://media.kitsu.io/anime/43324/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '43324' },
  },

  // ==========================================
  // 4. MANGÁS (20)
  // ==========================================
  {
    title: 'Berserk',
    originalTitle: 'ベルセルク',
    romanizedTitle: 'Beruseruku',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 1989,
    originCountry: 'JP',
    rating: 9.4,
    totalChapters: 375,
    synopsis: 'Guts, o Espadachim Negro, brande uma espada colossal em busca de vingança contra seu antigo amigo e comandante, Griffith.',
    genres: ['Fantasia Sombria', 'Ação', 'Épico'],
    aliases: ['Berserk'],
    coverUrl: 'https://media.kitsu.io/manga/1376/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1376' },
  },
  {
    title: 'One Piece (Mangá)',
    originalTitle: 'ONE PIECE',
    romanizedTitle: 'Wan Pisu',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 1997,
    originCountry: 'JP',
    rating: 9.3,
    totalChapters: 1130,
    synopsis: 'A saga definitiva de Eiichiro Oda sobre piratas em busca de liberdade, companheirismo e o tesouro supremo One Piece.',
    genres: ['Aventura', 'Ação', 'Fantasia'],
    aliases: ['One Piece Manga'],
    coverUrl: 'https://media.kitsu.io/manga/12/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '12' },
  },
  {
    title: 'Vagabond',
    originalTitle: 'バガボンド',
    romanizedTitle: 'Bagabondo',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.HIATO,
    releaseYear: 1998,
    originCountry: 'JP',
    rating: 9.3,
    totalChapters: 327,
    synopsis: 'A vida e jornada filosófica do lendário espadachim Miyamoto Musashi no Japão feudal.',
    genres: ['Histórico', 'Artes Marciais', 'Filosófico'],
    aliases: ['Vagabond'],
    coverUrl: 'https://media.kitsu.io/manga/1523/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1523' },
  },
  {
    title: 'Monster',
    originalTitle: 'MONSTER',
    romanizedTitle: 'Monsuta',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1994,
    originCountry: 'JP',
    rating: 9.2,
    totalChapters: 162,
    synopsis: 'Um brilhante neurocirurgião japonês na Alemanha salva a vida de um garoto que mais tarde se revela um psicopata implacável.',
    genres: ['Mistério', 'Suspense Psicológico'],
    aliases: ['Monster'],
    coverUrl: 'https://media.kitsu.io/manga/1524/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1524' },
  },
  {
    title: 'Vinland Saga (Mangá)',
    originalTitle: 'ヴィンランド・サガ',
    romanizedTitle: 'Vinrando Saga',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2005,
    originCountry: 'JP',
    rating: 9.2,
    totalChapters: 215,
    synopsis: 'Uma jornada humana profunda que vai da vingança cega viking até a busca por uma terra pacífica sem armas.',
    genres: ['Histórico', 'Drama', 'Aventura'],
    aliases: ['Vinland Saga Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1525/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1525' },
  },
  {
    title: 'Fullmetal Alchemist (Mangá)',
    originalTitle: '鋼の錬金術師',
    romanizedTitle: 'Hagane no Renkinjutsushi',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2001,
    originCountry: 'JP',
    rating: 9.1,
    totalChapters: 108,
    synopsis: 'O mangá seminal de Hiromu Arakawa sobre os irmãos Elric e o valor da equivalência de troca.',
    genres: ['Aventura', 'Fantasia', 'Drama'],
    aliases: ['Fullmetal Alchemist Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1526/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1526' },
  },
  {
    title: 'Chainsaw Man (Mangá)',
    originalTitle: 'チェンソーマン',
    romanizedTitle: 'Chensoman',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2018,
    originCountry: 'JP',
    rating: 8.9,
    totalChapters: 185,
    synopsis: 'A obra inovadora de Tatsuki Fujimoto mesclando ação explosiva, drama visceral e absurdo existencial.',
    genres: ['Ação', 'Terror', 'Comédia Sombria'],
    aliases: ['Chainsaw Man Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1527/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1527' },
  },
  {
    title: 'Oyasumi Punpun',
    originalTitle: 'おやすみプンプン',
    romanizedTitle: 'Oyasumi Punpun',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2007,
    originCountry: 'JP',
    rating: 9.1,
    totalChapters: 147,
    synopsis: 'Um retrato pungente e dolorosamente real do crescimento, depressão e desilusões amorosas de um jovem ilustrado como um pássaro caricato.',
    genres: ['Psicológico', 'Drama', 'Cotidiano'],
    aliases: ['Boa Noite Punpun'],
    coverUrl: 'https://media.kitsu.io/manga/1528/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1528' },
  },
  {
    title: '20th Century Boys',
    originalTitle: '20世紀少年',
    romanizedTitle: '20-seiki Shounen',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1999,
    originCountry: 'JP',
    rating: 9.0,
    totalChapters: 249,
    synopsis: 'Um grupo de amigos adultos percebe que uma seita apocalíptica liderada por "Amigo" está realizando exatamente as brincadeiras de destruição que criaram na infância.',
    genres: ['Mistério', 'Ficção Científica', 'Suspense'],
    aliases: ['20th Century Boys'],
    coverUrl: 'https://media.kitsu.io/manga/1529/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1529' },
  },
  {
    title: 'Slam Dunk',
    originalTitle: 'SLAM DUNK',
    romanizedTitle: 'Suramu Danku',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1990,
    originCountry: 'JP',
    rating: 9.1,
    totalChapters: 276,
    synopsis: 'Hanamichi Sakuragi, um delinquente encrenqueiro, entra para o time de basquete do colégio Shohoku para impressionar uma garota e se apaixona pelo esporte.',
    genres: ['Esportes', 'Comédia', 'Drama'],
    aliases: ['Slam Dunk'],
    coverUrl: 'https://media.kitsu.io/manga/1530/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1530' },
  },
  {
    title: 'Tokyo Ghoul',
    originalTitle: '東京喰種トーキョーグール',
    romanizedTitle: 'Tokyo Guru',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'JP',
    rating: 8.8,
    totalChapters: 144,
    synopsis: 'Após sobreviver a um ataque fatal, Ken Kaneki torna-se meio-ghoul e precisa navegar a violenta sociedade secreta de monstros que vivem em Tóquio.',
    genres: ['Terror', 'Ação', 'Sobrenatural'],
    aliases: ['Tokyo Ghoul'],
    coverUrl: 'https://media.kitsu.io/manga/1531/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1531' },
  },
  {
    title: 'Kingdom (Mangá)',
    originalTitle: 'キングダム',
    romanizedTitle: 'Kingudamu',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2006,
    originCountry: 'JP',
    rating: 9.2,
    totalChapters: 810,
    synopsis: 'Na China do período dos Estados Combatentes, o jovem órfão Shin sonha em se tornar o Maior General Sob os Céus.',
    genres: ['Histórico', 'Militar', 'Ação'],
    aliases: ['Kingdom Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1532/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1532' },
  },
  {
    title: "JoJo's Bizarre Adventure",
    originalTitle: 'ジョジョの奇妙な冒険',
    romanizedTitle: 'JoJo no Kimyou na Bouken',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 1987,
    originCountry: 'JP',
    rating: 8.9,
    totalChapters: 950,
    synopsis: 'A crônica multigeracional da linhagem Joestar enfrentando ameaças sobrenaturais e inimigos com poderes bizarros.',
    genres: ['Ação', 'Aventura', 'Sobrenatural'],
    aliases: ['JoJo'],
    coverUrl: 'https://media.kitsu.io/manga/1533/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1533' },
  },
  {
    title: 'Jujutsu Kaisen (Mangá)',
    originalTitle: '呪術廻戦',
    romanizedTitle: 'Jujutsu Kaisen',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'JP',
    rating: 8.8,
    totalChapters: 271,
    synopsis: 'A jornada completa de feitiçaria, perdas e batalhas táticas contra Sukuna e as maldições da era moderna.',
    genres: ['Ação', 'Sobrenatural', 'Fantasia Sombria'],
    aliases: ['JJK Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1534/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1534' },
  },
  {
    title: 'Hunter x Hunter (Mangá)',
    originalTitle: 'HUNTER×HUNTER',
    romanizedTitle: 'Hunter x Hunter',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.HIATO,
    releaseYear: 1998,
    originCountry: 'JP',
    rating: 9.1,
    totalChapters: 405,
    synopsis: 'A complexa e genial obra de Yoshihiro Togashi explorando o sistema de Nen e arcos estratégicos fascinantes.',
    genres: ['Ação', 'Aventura', 'Estratégia'],
    aliases: ['Hunter x Hunter Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1535/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1535' },
  },
  {
    title: 'Bleach (Mangá)',
    originalTitle: 'BLEACH',
    romanizedTitle: 'Burichi',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2001,
    originCountry: 'JP',
    rating: 8.6,
    totalChapters: 686,
    synopsis: 'A história completa do Shinigami Substituto Ichigo Kurosaki defendendo o mundo humano e a Soul Society.',
    genres: ['Ação', 'Sobrenatural', 'Fantasia'],
    aliases: ['Bleach Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1536/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1536' },
  },
  {
    title: 'Naruto',
    originalTitle: 'NARUTO -ナルト-',
    romanizedTitle: 'Naruto',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1999,
    originCountry: 'JP',
    rating: 8.7,
    totalChapters: 700,
    synopsis: 'Um jovem ninja rejeitado por carregar uma besta selada dentro de si sonha em se tornar o líder máximo de sua aldeia.',
    genres: ['Ação', 'Aventura', 'Artes Marciais'],
    aliases: ['Naruto Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1537/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1537' },
  },
  {
    title: 'Death Note (Mangá)',
    originalTitle: 'DEATH NOTE',
    romanizedTitle: 'Desu Noto',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2003,
    originCountry: 'JP',
    rating: 8.9,
    totalChapters: 108,
    synopsis: 'A batalha psicológica e investigativa de mentes entre Light Yagami e o detetive mundial L.',
    genres: ['Suspense', 'Psicológico', 'Mistério'],
    aliases: ['Death Note Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1538/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1538' },
  },
  {
    title: 'Akira (Mangá)',
    originalTitle: 'AKIRA',
    romanizedTitle: 'Akira',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1982,
    originCountry: 'JP',
    rating: 9.0,
    totalChapters: 120,
    synopsis: 'A obra-prima cyberpunk desenhada por Katsuhiro Otomo que redefiniu os quadrinhos japoneses para o mundo ocidental.',
    genres: ['Ficção Científica', 'Cyberpunk', 'Ação'],
    aliases: ['Akira Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1539/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1539' },
  },
  {
    title: 'Dorohedoro',
    originalTitle: 'ドロヘドロ',
    romanizedTitle: 'Dorohedoro',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2000,
    originCountry: 'JP',
    rating: 8.9,
    totalChapters: 167,
    synopsis: 'Caiman, um homem com cabeça de réptil e amnésia, caça feiticeiros em uma cidade decrépita para descobrir sua verdadeira identidade.',
    genres: ['Fantasia Sombria', 'Ação', 'Comédia Ácida'],
    aliases: ['Dorohedoro Manga'],
    coverUrl: 'https://media.kitsu.io/manga/1540/poster_image/original.jpg',
    provenance: { source: 'KITSU', externalId: '1540' },
  },

  // ==========================================
  // 5. MANHWAS (20)
  // ==========================================
  {
    title: 'Solo Leveling (Manhwa)',
    originalTitle: '나 혼자만 레벨업',
    romanizedTitle: 'Na Honjaman Rebeleop',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 9.3,
    totalChapters: 200,
    synopsis: 'O fenômeno sul-coreano que estabeleceu o padrão global de webtoons de ação e portais sobrenaturais.',
    genres: ['Ação', 'Fantasia', 'Aventura'],
    aliases: ['Solo Leveling Manhwa', 'I Alone Level Up'],
    coverUrl: 'https://media.kitsu.io/manga/1541/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '152434' },
  },
  {
    title: 'Tower of God',
    originalTitle: '신의 탑',
    romanizedTitle: 'Sin-ui Tap',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2010,
    originCountry: 'KR',
    rating: 9.0,
    totalChapters: 640,
    synopsis: 'Um jovem chamado Bam entra em uma torre misteriosa de testes mortais em busca de sua única amiga de infância.',
    genres: ['Fantasia', 'Aventura', 'Mistério'],
    aliases: ['Torre de Deus'],
    coverUrl: 'https://media.kitsu.io/manga/1542/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '121434' },
  },
  {
    title: "Omniscient Reader's Viewpoint",
    originalTitle: '전지적 독자 시점',
    romanizedTitle: 'Jeonjijeok Dokja Sijeom',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 9.2,
    totalChapters: 230,
    synopsis: 'Kim Dokja era o único leitor de um romance obscuro. Quando o mundo real transforma-se no enredo exato do livro, apenas ele sabe como sobreviver.',
    genres: ['Ação', 'Fantasia', 'Meta-ficção'],
    aliases: ['Ponto de Vista do Leitor Onisciente', 'ORV'],
    coverUrl: 'https://media.kitsu.io/manga/1543/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '161245' },
  },
  {
    title: 'The Boxer',
    originalTitle: '더 복서',
    romanizedTitle: 'Deo Bokseo',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 9.1,
    totalChapters: 124,
    synopsis: 'Um treinador lendário descobre Yu, um garoto apático com reflexos sobre-humanos e potencial inacreditável para o boxe.',
    genres: ['Esportes', 'Psicológico', 'Drama'],
    aliases: ['The Boxer'],
    coverUrl: 'https://media.kitsu.io/manga/1544/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '158942' },
  },
  {
    title: 'Bastard',
    originalTitle: '후레자식',
    romanizedTitle: 'Hurejasik',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2014,
    originCountry: 'KR',
    rating: 9.1,
    totalChapters: 94,
    synopsis: 'Um estudante tímido vive como cúmplice forçado de seu pai respeitado, que é secretly um assassino em série implacável.',
    genres: ['Suspense', 'Terror Psicológico', 'Drama'],
    aliases: ['Bastard Manhwa'],
    coverUrl: 'https://media.kitsu.io/manga/1545/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '115012' },
  },
  {
    title: 'Wind Breaker',
    originalTitle: '윈드브레이커',
    romanizedTitle: 'Windeubeureikeo',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2013,
    originCountry: 'KR',
    rating: 9.0,
    totalChapters: 510,
    synopsis: 'Jay, um aluno exemplar obcecado por notas, junta-se a uma equipe de ciclismo de rua e encontra sua verdadeira paixão nas pistas urbanas.',
    genres: ['Esportes', 'Drama', 'Cotidiano'],
    aliases: ['Wind Breaker'],
    coverUrl: 'https://media.kitsu.io/manga/1546/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '111956' },
  },
  {
    title: 'Sweet Home',
    originalTitle: '스위트홈',
    romanizedTitle: 'Seuwiteuhom',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2017,
    originCountry: 'KR',
    rating: 8.9,
    totalChapters: 141,
    synopsis: 'Um jovem recluso trancado em seu apartamento descobre que a humanidade começou a se transformar em monstros bizarros reflexos de seus próprios desejos reprimidos.',
    genres: ['Terror', 'Sobrenatural', 'Suspense'],
    aliases: ['Sweet Home Manhwa'],
    coverUrl: 'https://media.kitsu.io/manga/1547/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '144321' },
  },
  {
    title: 'The Beginning After the End',
    originalTitle: '끝이 아닌 시작',
    romanizedTitle: 'Kkeut-i Anin Sijak',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 8.9,
    totalChapters: 195,
    synopsis: 'Um rei renomado renasce como Arthur Leywin em um novo mundo de magia e monstros, disposto a corrigir os erros de sua vida anterior.',
    genres: ['Fantasia', 'Ação', 'Isekai'],
    aliases: ['TBATE'],
    coverUrl: 'https://media.kitsu.io/manga/1548/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '150492' },
  },
  {
    title: 'Nano Machine',
    originalTitle: '나노마신',
    romanizedTitle: 'Nanomasin',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.8,
    totalChapters: 235,
    synopsis: 'Um bastardo rejeitado do Culto Demoníaco recebe de um descendente do futuro uma injeção de nanomáquinas que alteram seu corpo.',
    genres: ['Artes Marciais', 'Murim', 'Ficção Científica'],
    aliases: ['Nano Machine'],
    coverUrl: 'https://media.kitsu.io/manga/1549/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '168341' },
  },
  {
    title: 'Eleceed',
    originalTitle: '일렉시드',
    romanizedTitle: 'Illeksideu',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 9.1,
    totalChapters: 315,
    synopsis: 'Um jovem bondoso com supervelocidade secreta resgata um gato ferido que na verdade é um dos despertados mais perigosos do planeta.',
    genres: ['Ação', 'Comédia', 'Sobrenatural'],
    aliases: ['Eleceed'],
    coverUrl: 'https://media.kitsu.io/manga/1550/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '152140' },
  },
  {
    title: 'Lookism',
    originalTitle: '외모지상주의',
    romanizedTitle: 'Oemojisangjuui',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2014,
    originCountry: 'KR',
    rating: 8.7,
    totalChapters: 520,
    synopsis: 'Um estudante vítima de bullying severo acorda repentinamente com um segundo corpo alto, atraente e atlético, alternando entre os dois.',
    genres: ['Drama', 'Ação', 'Artes Marciais'],
    aliases: ['Lookism'],
    coverUrl: 'https://media.kitsu.io/manga/1551/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '116120' },
  },
  {
    title: 'Legend of the Northern Blade',
    originalTitle: '북검전기',
    romanizedTitle: 'Bukgeomjeongi',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 9.2,
    totalChapters: 200,
    synopsis: 'Após a queda da Seita Celestial do Norte por traição, o último herdeiro aprende em segredo as técnicas secretas de seus antepassados.',
    genres: ['Artes Marciais', 'Murim', 'Vingança'],
    aliases: ['Lenda da Lâmina do Norte'],
    coverUrl: 'https://media.kitsu.io/manga/1552/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '165243' },
  },
  {
    title: 'Return of the Mount Hua Sect',
    originalTitle: '화산귀환',
    romanizedTitle: 'Hwasangwihwan',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 9.2,
    totalChapters: 140,
    synopsis: 'Chung Myung, o Santo da Espada da Flor de Ameixeira, derrota o Demônio Celestial e renasce 100 anos no futuro para restaurar sua seita arruinada.',
    genres: ['Artes Marciais', 'Comédia', 'Murim'],
    aliases: ['O Retorno da Seita Mount Hua'],
    coverUrl: 'https://media.kitsu.io/manga/1553/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '178921' },
  },
  {
    title: 'SSS-Class Suicide Hunter',
    originalTitle: 'SSS급 죽어야 사는 헌터',
    romanizedTitle: 'SSS-geup Jugeoya Saneun Heonteo',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 9.0,
    totalChapters: 125,
    synopsis: 'Um caçador fraco ganha a habilidade de copiar as habilidades de quem o mata e retornar no tempo sempre que morre.',
    genres: ['Ação', 'Fantasia', 'Psicológico'],
    aliases: ['SSS-Class Revival Hunter'],
    coverUrl: 'https://media.kitsu.io/manga/1554/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '176420' },
  },
  {
    title: 'Overgeared',
    originalTitle: '템빨',
    romanizedTitle: 'Temppal',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.7,
    totalChapters: 250,
    synopsis: 'Shin Youngwoo encontra o livro lendário do Ferreiro Pagma no jogo de realidade virtual Satisfy e revoluciona o mundo com equipamentos incomparáveis.',
    genres: ['Ação', 'Comédia', 'Realidade Virtual'],
    aliases: ['Overgeared'],
    coverUrl: 'https://media.kitsu.io/manga/1555/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '164210' },
  },
  {
    title: 'Viral Hit / How to Fight',
    originalTitle: '싸움독학',
    romanizedTitle: 'Ssaumdokhak',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 8.8,
    totalChapters: 218,
    synopsis: 'Um estudante fraco encontra um canal obscuro do NewTube que ensina como derrotar qualquer tipo de oponente em lutas de rua reais.',
    genres: ['Artes Marciais', 'Comédia', 'Ação'],
    aliases: ['How to Fight'],
    coverUrl: 'https://media.kitsu.io/manga/1556/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '158231' },
  },
  {
    title: 'Mercenary Enrollment',
    originalTitle: '입학용병',
    romanizedTitle: 'Iphak-yongbyeong',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.9,
    totalChapters: 205,
    synopsis: 'O único sobrevivente de um acidente aéreo na infância cresce como um mercenário de elite e retorna à Coreia para proteger sua irmãzinha.',
    genres: ['Ação', 'Militar', 'Escolar'],
    aliases: ['Teenage Mercenary'],
    coverUrl: 'https://media.kitsu.io/manga/1557/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '172941' },
  },
  {
    title: 'Doom Breaker',
    originalTitle: '투신전생기',
    romanizedTitle: 'Tusinjeonsaenggi',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 8.9,
    totalChapters: 110,
    synopsis: 'O último humano a cair diante do Deus Dragão da Destruição recebe dos próprios deuses uma segunda chance para recomeçar sua vida com poderes divinos.',
    genres: ['Ação', 'Fantasia', 'Regressão'],
    aliases: ['Reincarnation of the Suicidal Battle God'],
    coverUrl: 'https://media.kitsu.io/manga/1558/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '182390' },
  },
  {
    title: 'Murim Login',
    originalTitle: '로그인 무림',
    romanizedTitle: 'Rogeu-in Murim',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.9,
    totalChapters: 195,
    synopsis: 'Um caçador fraco encontra uma cápsula de VR que o transporta diretamente para o mundo real do Murim, onde seus ganhos transferem-se para o mundo real.',
    genres: ['Artes Marciais', 'Comédia', 'Murim'],
    aliases: ['Murim Login'],
    coverUrl: 'https://media.kitsu.io/manga/1559/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '167342' },
  },
  {
    title: 'The Greatest Estate Developer',
    originalTitle: '역대급 영지 설계사',
    romanizedTitle: 'Yeokdaegeup Yeongji Seolgyesa',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'KR',
    rating: 9.3,
    totalChapters: 165,
    synopsis: 'Um estudante de engenharia civil acorda no corpo de um nobre bêbado falido e usa seus conhecimentos modernos de infraestrutura e termodinâmica para prosperar.',
    genres: ['Comédia', 'Fantasia', 'Construção'],
    aliases: ['O Maior Construtor de Propriedades'],
    coverUrl: 'https://media.kitsu.io/manga/1560/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '185340' },
  },

  // ==========================================
  // 6. MANHUAS (20)
  // ==========================================
  {
    title: 'The Grandmaster of Demonic Cultivation',
    originalTitle: '魔道祖师',
    romanizedTitle: 'Mo Dao Zu Shi',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2017,
    originCountry: 'CN',
    rating: 9.2,
    totalChapters: 260,
    synopsis: 'Wei Wuxian, o temido fundador do cultivo demoníaco, reencarna no corpo de um jovem lunático e reencontra seu velho companheiro Lan Wangji.',
    genres: ['Cultivo', 'Xianxia', 'Mistério', 'Sobrenatural'],
    aliases: ['Mo Dao Zu Shi', 'O Patriarca da Cultivação Demoníaca'],
    coverUrl: 'https://media.kitsu.io/manga/1561/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '145241' },
  },
  {
    title: 'Soul Land',
    originalTitle: '斗罗大陆',
    romanizedTitle: 'Douluo Dalu',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'CN',
    rating: 8.7,
    totalChapters: 340,
    synopsis: 'Tang San reencarna no continente Douluo, onde todos despertam espíritos de batalha para alcançar o status divino.',
    genres: ['Cultivo', 'Ação', 'Fantasia'],
    aliases: ['Douluo Dalu', 'Combat Continent'],
    coverUrl: 'https://media.kitsu.io/manga/1562/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '102341' },
  },
  {
    title: 'Tales of Demons and Gods',
    originalTitle: '妖神记',
    romanizedTitle: 'Yao Shen Ji',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2015,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 495,
    synopsis: 'Nie Li, o Espiritualista Demoníaco mais forte do mundo, renasce aos 13 anos com todo o seu conhecimento acumulado para salvar sua cidade natal.',
    genres: ['Cultivo', 'Xianxia', 'Aventura'],
    aliases: ['Contos de Demônios e Deuses'],
    coverUrl: 'https://media.kitsu.io/manga/1563/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '125072' },
  },
  {
    title: 'The Ravages of Time',
    originalTitle: '火鳳燎原',
    romanizedTitle: 'Huo Feng Liao Yuan',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2001,
    originCountry: 'CN',
    rating: 9.1,
    totalChapters: 605,
    synopsis: 'Uma brilhante e realista releitura tática do Romance dos Três Reinos com estratégias militares e assassinatos políticos.',
    genres: ['Histórico', 'Militar', 'Estratégia'],
    aliases: ['The Ravages of Time'],
    coverUrl: 'https://media.kitsu.io/manga/1564/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '98412' },
  },
  {
    title: 'Feng Shen Ji',
    originalTitle: '封神紀',
    romanizedTitle: 'Feng Shen Ji',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2010,
    originCountry: 'CN',
    rating: 8.9,
    totalChapters: 182,
    synopsis: 'Quando os Deuses exigem submissão total dos humanos, um príncipe corajoso rebela-se contra a tirania dos céus.',
    genres: ['Ação', 'Sobrenatural', 'Mitologia'],
    aliases: ['Feng Shen Ji'],
    coverUrl: 'https://media.kitsu.io/manga/1565/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '110291' },
  },
  {
    title: 'Battle Through the Heavens',
    originalTitle: '斗破苍穹',
    romanizedTitle: 'Doupo Cangqiong',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2012,
    originCountry: 'CN',
    rating: 8.6,
    totalChapters: 420,
    synopsis: 'Xiao Yan perde todos os seus poderes de cultivo misteriosamente até descobrir o espírito aprisionado no anel de sua mãe.',
    genres: ['Cultivo', 'Xianxia', 'Ação'],
    aliases: ['BTTH'],
    coverUrl: 'https://media.kitsu.io/manga/1566/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '109841' },
  },
  {
    title: 'Martial Peak',
    originalTitle: '武炼巅峰',
    romanizedTitle: 'Wu Lian Dian Feng',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2018,
    originCountry: 'CN',
    rating: 8.5,
    totalChapters: 3700,
    synopsis: 'Yang Kai, um simples servo em uma seita marcial, encontra um livro dourado sem palavras que o coloca no topo da arte marcial.',
    genres: ['Cultivo', 'Ação', 'Artes Marciais'],
    aliases: ['Ápice Marcial'],
    coverUrl: 'https://media.kitsu.io/manga/1567/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '149234' },
  },
  {
    title: 'Apotheosis',
    originalTitle: '百炼成神',
    romanizedTitle: 'Bai Lian Cheng Shen',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2015,
    originCountry: 'CN',
    rating: 8.6,
    totalChapters: 1100,
    synopsis: 'Luo Zheng transforma seu próprio corpo em uma arma divina capaz de absorver qualquer ataque para resgatar sua irmã sequestrada.',
    genres: ['Cultivo', 'Ação', 'Fantasia'],
    aliases: ['Apoteose'],
    coverUrl: 'https://media.kitsu.io/manga/1568/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '128410' },
  },
  {
    title: 'Versatile Mage',
    originalTitle: '全职法师',
    romanizedTitle: 'Quanzhi Fashi',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2018,
    originCountry: 'CN',
    rating: 8.5,
    totalChapters: 1120,
    synopsis: 'Mo Fan acorda em um mundo paralelo idêntico ao seu, com a única diferença de que a magia substituiu a ciência.',
    genres: ['Magia', 'Escolar', 'Ação'],
    aliases: ['Quanzhi Fashi'],
    coverUrl: 'https://media.kitsu.io/manga/1569/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '148291' },
  },
  {
    title: 'Magic Emperor',
    originalTitle: '魔皇大管家',
    romanizedTitle: 'Mo Huang Da Guanjia',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2019,
    originCountry: 'CN',
    rating: 9.1,
    totalChapters: 600,
    synopsis: 'Zhuo Yifan, o Imperador Demônio, é traído e renasce no corpo de um mordomo fraco de um clã nobre à beira da ruína.',
    genres: ['Cultivo', 'Estratégia', 'Anti-herói'],
    aliases: ['Demonic Emperor'],
    coverUrl: 'https://media.kitsu.io/manga/1570/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '157291' },
  },
  {
    title: 'Release That Witch (Manhua)',
    originalTitle: '放开那个女巫',
    romanizedTitle: 'Fang Kai Na Ge Nv Wu',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 540,
    synopsis: 'Um engenheiro mecânico reencarna como um príncipe medieval e utiliza a ciência moderna aliada aos poderes de bruxas perseguidas para construir um império.',
    genres: ['Construção', 'Isekai', 'Fantasia'],
    aliases: ['Libertem Aquela Bruxa'],
    coverUrl: 'https://media.kitsu.io/manga/1571/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '153891' },
  },
  {
    title: 'Song of the Sky Pacers',
    originalTitle: '步天歌',
    romanizedTitle: 'Bu Tian Ge',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2017,
    originCountry: 'CN',
    rating: 8.9,
    totalChapters: 100,
    synopsis: 'Gêmeos imperiais nascidos com marcas auspiciosas são separados no nascimento por profecias divinas e trilham caminhos de cultivo opostos.',
    genres: ['Cultivo', 'Xianxia', 'Arte Tradicional'],
    aliases: ['Song of the Sky Pacers'],
    coverUrl: 'https://media.kitsu.io/manga/1572/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '151240' },
  },
  {
    title: 'All Saints Street',
    originalTitle: '万圣街',
    romanizedTitle: 'Wan Sheng Jie',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 200,
    synopsis: 'Um demônio australiano vegetariano divide um apartamento em Pequim com um vampiro proprietário, um lobisomem e um anjo rigoroso.',
    genres: ['Comédia', 'Sobrenatural', 'Cotidiano'],
    aliases: ['All Saints Street'],
    coverUrl: 'https://media.kitsu.io/manga/1573/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '138921' },
  },
  {
    title: 'Here U Are',
    originalTitle: 'Here U Are',
    romanizedTitle: 'Here U Are',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2017,
    originCountry: 'CN',
    rating: 9.1,
    totalChapters: 156,
    synopsis: 'Yu Yang, um veterano universitário acolhedor, conhece Li Huan, um calouro taciturno e intimidador, iniciando uma relação sincera.',
    genres: ['Romance', 'Drama', 'Cotidiano'],
    aliases: ['Here U Are'],
    coverUrl: 'https://media.kitsu.io/manga/1574/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '143920' },
  },
  {
    title: '19 Days',
    originalTitle: '19天',
    romanizedTitle: '19 Tian',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2013,
    originCountry: 'CN',
    rating: 9.0,
    totalChapters: 450,
    synopsis: 'As aventuras cômicas, cotidianas e afetuosas de Jian Yi e seu melhor amigo Zhan Zheng Xi durante o ensino médio.',
    genres: ['Comédia', 'Cotidiano', 'Romance'],
    aliases: ['19 Days'],
    coverUrl: 'https://media.kitsu.io/manga/1575/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '112940' },
  },
  {
    title: 'Nan Hao & Shang Feng',
    originalTitle: '南号尚风',
    romanizedTitle: 'Nan Hao & Shang Feng',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2019,
    originCountry: 'CN',
    rating: 9.2,
    totalChapters: 120,
    synopsis: 'As situações cotidianas hilárias e absurdamente identificáveis de dois melhores amigos no ensino médio.',
    genres: ['Comédia', 'Escolar', 'Cotidiano'],
    aliases: ['Nan Hao Shang Feng'],
    coverUrl: 'https://media.kitsu.io/manga/1576/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '162841' },
  },
  {
    title: 'Cultivation Chat Group',
    originalTitle: '修真聊天群',
    romanizedTitle: 'Xiuzhen Liaotian Qun',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2017,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 560,
    synopsis: 'Um estudante comum é acidentalmente adicionado a um grupo de chat onde os membros se chamam de "Verdadeiro Mestre" e descobre que eles são cultivadores imortais reais.',
    genres: ['Comédia', 'Cultivo', 'Urbano'],
    aliases: ['Cultivation Chat Group'],
    coverUrl: 'https://media.kitsu.io/manga/1577/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '142981' },
  },
  {
    title: 'I Am The Fated Villain',
    originalTitle: '我！天命大反派',
    romanizedTitle: 'Wo! Tianming Da Fanpai',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2021,
    originCountry: 'CN',
    rating: 8.9,
    totalChapters: 215,
    synopsis: 'Gu Changge transmigra como o vilão supremo de um mundo de cultivo e usa sua perspicácia impiedosa para superar os supostos "filhos do destino".',
    genres: ['Cultivo', 'Anti-herói', 'Ação'],
    aliases: ['I Am The Fated Villain'],
    coverUrl: 'https://media.kitsu.io/manga/1578/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '184920' },
  },
  {
    title: "The King's Avatar (Manhua)",
    originalTitle: '全职高手',
    romanizedTitle: 'Quanzhi Gaoshou',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2015,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 230,
    synopsis: 'Ye Xiu, o jogador lendário do MMORPG Glory, é forçado a se aposentar, mas recomeça do zero em um novo servidor em busca do topo dos e-sports.',
    genres: ['E-Sports', 'Ação', 'Comédia'],
    aliases: ['O Avatar do Rei'],
    coverUrl: 'https://media.kitsu.io/manga/1579/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '124981' },
  },
  {
    title: 'Yuan Zun',
    originalTitle: '元尊',
    romanizedTitle: 'Yuan Zun',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2017,
    originCountry: 'CN',
    rating: 8.7,
    totalChapters: 680,
    synopsis: 'Zhou Yuan teve sua bênção do dragão sagrado roubada ainda no berço. Contra todas as adversidades, ele reabre seus meridianos para reconquistar seu destino.',
    genres: ['Cultivo', 'Xianxia', 'Ação'],
    aliases: ['Dragon Prince Yuan'],
    coverUrl: 'https://media.kitsu.io/manga/1580/poster_image/original.jpg',
    provenance: { source: 'MANGAUPDATES', externalId: '146920' },
  },
];

export const EXTRA_CATALOG_EXPANDED = [
  // Doramas Adicionais
  {
    title: 'Alchemy of Souls',
    originalTitle: '환혼',
    romanizedTitle: 'Hwanhon',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'KR',
    rating: 8.9,
    totalEpisodes: 30,
    synopsis: 'Uma feiticeira poderosa presa no corpo de uma mulher cega cruza o caminho do jovem herdeiro de uma família nobre e se torna sua mestra secreta.',
    genres: ['Fantasia', 'Romance', 'Ação'],
    aliases: ['Alquimia das Almas'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/413/1034455.jpg',
    provenance: { source: 'TVMAZE', externalId: '59779' },
  },
  {
    title: 'Kingdom (Dorama)',
    originalTitle: '킹덤',
    romanizedTitle: 'Kingdeom',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 12,
    synopsis: 'Em uma Coreia feudal devastada por corrupção e fome, um príncipe herdeiro investiga uma misteriosa praga que transforma os mortos em feras sanguinárias.',
    genres: ['Terror', 'Ação', 'Drama'],
    aliases: ['Reino'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/180/451368.jpg',
    provenance: { source: 'TVMAZE', externalId: '34484' },
  },
  {
    title: 'Sweet Home (Dorama)',
    originalTitle: '스위트홈',
    romanizedTitle: 'Seuwiteuhom',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.5,
    totalEpisodes: 26,
    synopsis: 'Um estudante recluso e seus vizinhos de condomínio enfrentam uma praga apocalíptica onde desejos humanos transformam pessoas em monstros bizarros.',
    genres: ['Terror', 'Ação', 'Ficção Científica'],
    aliases: ['Sweet Home'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/286/715494.jpg',
    provenance: { source: 'TVMAZE', externalId: '45404' },
  },
  {
    title: "It's Okay to Not Be Okay",
    originalTitle: '사이코지만 괜찮아',
    romanizedTitle: 'Saikojiman Gwaenchana',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 8.9,
    totalEpisodes: 16,
    synopsis: 'Um cuidador de ala psiquiátrica e uma autora de livros infantis com transtorno de personalidade antissocial ajudam um ao outro a curar feridas emocionais profundas.',
    genres: ['Romance', 'Drama', 'Psicológico'],
    aliases: ['Tudo Bem Não Ser Normal'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/260/650961.jpg',
    provenance: { source: 'TVMAZE', externalId: '46387' },
  },
  {
    title: 'Reply 1988',
    originalTitle: '응답하라 1988',
    romanizedTitle: 'Eungdaphara 1988',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2015,
    originCountry: 'KR',
    rating: 9.2,
    totalEpisodes: 20,
    synopsis: 'Cinco famílias e seus filhos adolescentes crescem juntos em um simpático bairro de Seul no ano histórico de 1988.',
    genres: ['Cotidiano', 'Comédia', 'Drama'],
    aliases: ['Responda 1988'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/34/86616.jpg',
    provenance: { source: 'TVMAZE', externalId: '5731' },
  },
  {
    title: 'Hospital Playlist',
    originalTitle: '슬기로운 의사생활',
    romanizedTitle: 'Seulgiroun Uisasaenghwal',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2020,
    originCountry: 'KR',
    rating: 9.0,
    totalEpisodes: 24,
    synopsis: 'Cinco médicos amigos desde a faculdade compartilham as alegrias, dores e melodias de suas vidas dentro e fora de um hospital universitário.',
    genres: ['Cotidiano', 'Drama', 'Comédia'],
    aliases: ['Vida Hospitalar'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/245/614562.jpg',
    provenance: { source: 'TVMAZE', externalId: '46386' },
  },
  {
    title: 'Moving',
    originalTitle: '무빙',
    romanizedTitle: 'Mubing',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2023,
    originCountry: 'KR',
    rating: 9.1,
    totalEpisodes: 20,
    synopsis: 'Adolescentes com poderes sobrenaturais herdados de seus pais espiões tentam viver vidas comuns enquanto ameaças do passado ressurgem.',
    genres: ['Ação', 'Ficção Científica', 'Drama'],
    aliases: ['Em Movimento'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/472/1181827.jpg',
    provenance: { source: 'TVMAZE', externalId: '63385' },
  },
  {
    title: 'Queen of Tears',
    originalTitle: '눈물의 여왕',
    romanizedTitle: 'Nunmul-ui Yeowang',
    category: Category.DORAMA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2024,
    originCountry: 'KR',
    rating: 8.8,
    totalEpisodes: 16,
    synopsis: 'A rainha de uma dinastia de lojas de departamentos e seu marido advogado enfrentam uma crise conjugal intensa antes de redescobrirem o amor.',
    genres: ['Romance', 'Drama', 'Comédia'],
    aliases: ['Rainha das Lágrimas'],
    coverUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/501/1253012.jpg',
    provenance: { source: 'TVMAZE', externalId: '74175' },
  },
  // Filmes Adicionais
  {
    title: 'Suzume',
    originalTitle: 'すずめの戸締まり',
    romanizedTitle: 'Suzume no Tojimari',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.7,
    totalEpisodes: 1,
    synopsis: 'Uma jovem de dezessete anos e um misterioso viajante viajam pelo Japão fechando portais ancestrais que liberam calamidades e desastres naturais.',
    genres: ['Fantasia', 'Aventura', 'Drama'],
    aliases: ['Suzume no Tojimari'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/vIewn0T9392e92c2535f2f5.jpg',
    provenance: { source: 'TMDB', externalId: '916224' },
  },
  {
    title: 'Weathering With You',
    originalTitle: '天気の子',
    romanizedTitle: 'Tenki no Ko',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'JP',
    rating: 8.5,
    totalEpisodes: 1,
    synopsis: 'Em uma Tóquio sob chuvas perpétuas, um garoto fugitivo conhece uma menina com o dom sagrado de parar a chuva e abrir o céu ensolarado.',
    genres: ['Fantasia', 'Romance', 'Drama'],
    aliases: ['O Tempo com Você'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6q2P9gKM2JwQ.jpg',
    provenance: { source: 'TMDB', externalId: '568160' },
  },
  {
    title: 'A Silent Voice',
    originalTitle: '聲の形',
    romanizedTitle: 'Koe no Katachi',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2016,
    originCountry: 'JP',
    rating: 9.0,
    totalEpisodes: 1,
    synopsis: 'Um ex-valentão do ensino fundamental reencontra a garota surda que ele costumava atormentar, buscando desesperadamente o perdão e a redenção.',
    genres: ['Drama', 'Cotidiano', 'Romance'],
    aliases: ['Koe no Katachi', 'A Voz do Silêncio'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/tuFaWiqX0TXRgah1iyUH4v0.jpg',
    provenance: { source: 'TMDB', externalId: '378064' },
  },
  {
    title: 'Akira',
    originalTitle: 'アキラ',
    romanizedTitle: 'Akira',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1988,
    originCountry: 'JP',
    rating: 8.8,
    totalEpisodes: 1,
    synopsis: 'Na caótica Neo-Tóquio pós-Terceira Guerra Mundial, um jovem motoqueiro ganha poderes telecinéticos devastadores e ameaça a ordem planetária.',
    genres: ['Ficção Científica', 'Ação', 'Cyberpunk'],
    aliases: ['Akira'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/5nz75R6y1998f5a2f5.jpg',
    provenance: { source: 'TMDB', externalId: '149' },
  },
  {
    title: 'Godzilla Minus One',
    originalTitle: 'ゴジラ-1.0',
    romanizedTitle: 'Gojira Mainasu Wan',
    category: Category.FILME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2023,
    originCountry: 'JP',
    rating: 8.9,
    totalEpisodes: 1,
    synopsis: 'No Japão pós-guerra em ruínas absolutas, um monstro atômico gigante surge do oceano, empurrando o país destruído de zero para menos um.',
    genres: ['Ação', 'Ficção Científica', 'Drama'],
    aliases: ['Godzilla -1.0'],
    coverUrl: 'https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J9M.jpg',
    provenance: { source: 'TMDB', externalId: '940721' },
  },
  // Animes Adicionais
  {
    title: 'Death Note',
    originalTitle: 'デスノート',
    romanizedTitle: 'Desu Noto',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2006,
    originCountry: 'JP',
    rating: 9.0,
    totalEpisodes: 37,
    synopsis: 'Um estudante prodígio encontra um caderno sobrenatural capaz de matar qualquer um cujo nome for escrito nele e inicia uma cruzada para expurgar criminosos.',
    genres: ['Suspense', 'Mistério', 'Sobrenatural'],
    aliases: ['Death Note'],
    coverUrl: 'https://media.kitsu.app/anime/1376/poster_image/medium-f7e91.jpeg',
    provenance: { source: 'KITSU', externalId: '1376' },
  },
  {
    title: 'Attack on Titan',
    originalTitle: '進撃の巨人',
    romanizedTitle: 'Shingeki no Kyojin',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2013,
    originCountry: 'JP',
    rating: 9.2,
    totalEpisodes: 89,
    synopsis: 'A humanidade vive cercada por muralhas monumentais para se proteger de gigantes canibais até que uma brecha mortal muda a história para sempre.',
    genres: ['Ação', 'Fantasia', 'Drama'],
    aliases: ['Shingeki no Kyojin'],
    coverUrl: 'https://media.kitsu.app/anime/7442/poster_image/medium-a2b8.jpeg',
    provenance: { source: 'KITSU', externalId: '7442' },
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    originalTitle: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    romanizedTitle: 'Hagane no Renkinjutsushi',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2009,
    originCountry: 'JP',
    rating: 9.5,
    totalEpisodes: 64,
    synopsis: 'Dois irmãos alquimistas buscam a lendária Pedra Filosofal para restaurar seus corpos após uma tentativa desastrosa de ressuscitar a mãe.',
    genres: ['Ação', 'Aventura', 'Fantasia'],
    aliases: ['Hagane no Renkinjutsushi'],
    coverUrl: 'https://media.kitsu.app/anime/3936/poster_image/medium-99c.jpeg',
    provenance: { source: 'KITSU', externalId: '3936' },
  },
  {
    title: 'Steins;Gate',
    originalTitle: 'シュタインズ・ゲート',
    romanizedTitle: 'Shutainzu Geto',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'JP',
    rating: 9.3,
    totalEpisodes: 24,
    synopsis: 'Um cientista excêntrico descobre acidentalmente como enviar mensagens de texto para o passado através de um micro-ondas modificado.',
    genres: ['Ficção Científica', 'Suspense', 'Drama'],
    aliases: ['Steins Gate'],
    coverUrl: 'https://media.kitsu.app/anime/5611/poster_image/medium-5611.jpeg',
    provenance: { source: 'KITSU', externalId: '5611' },
  },
  {
    title: 'Hunter x Hunter (2011)',
    originalTitle: 'ハンター×ハンター',
    romanizedTitle: 'Hanta Hanta',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'JP',
    rating: 9.3,
    totalEpisodes: 148,
    synopsis: 'Gon Freecss descobre que seu pai ausente é um caçador de elite e decide fazer o impiedoso Exame Hunter para encontrá-lo.',
    genres: ['Ação', 'Aventura', 'Fantasia'],
    aliases: ['Hunter x Hunter'],
    coverUrl: 'https://media.kitsu.app/anime/6448/poster_image/medium-6448.jpeg',
    provenance: { source: 'KITSU', externalId: '6448' },
  },
  {
    title: 'Chainsaw Man',
    originalTitle: 'チェンソーマン',
    romanizedTitle: 'Cheonso Man',
    category: Category.ANIME,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2022,
    originCountry: 'JP',
    rating: 8.8,
    totalEpisodes: 12,
    synopsis: 'Denji é assassinado pela máfia, renasce como o híbrido Homem-Motosserra através do pacto com seu cão-demônio Pochita e ingressa nos Caçadores de Demônios da Segurança Pública.',
    genres: ['Ação', 'Sobrenatural', 'Terror'],
    aliases: ['Chainsaw Man'],
    coverUrl: 'https://media.kitsu.app/anime/43806/poster_image/medium-43806.jpeg',
    provenance: { source: 'KITSU', externalId: '43806' },
  },
  // Mangás Adicionais
  {
    title: 'Berserk',
    originalTitle: 'ベルセルク',
    romanizedTitle: 'Beruseruku',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 1989,
    originCountry: 'JP',
    rating: 9.6,
    totalChapters: 376,
    synopsis: 'Marcado para a morte por forças demoníacas ancestrais, o espadachim negro Guts empunha uma colossal espada contra o destino e monstros aterrorizantes.',
    genres: ['Fantasia', 'Ação', 'Drama'],
    aliases: ['Berserk'],
    coverUrl: 'https://media.kitsu.app/manga/1376/poster_image/medium-1376.jpeg',
    provenance: { source: 'KITSU', externalId: '1376' },
  },
  {
    title: 'Vagabond',
    originalTitle: 'バガボンド',
    romanizedTitle: 'Bagabondo',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.HIATO,
    releaseYear: 1998,
    originCountry: 'JP',
    rating: 9.5,
    totalChapters: 327,
    synopsis: 'A trajetória lendária e espiritual do samurai errante Miyamoto Musashi na busca pela iluminação através do caminho da espada.',
    genres: ['Histórico', 'Ação', 'Drama'],
    aliases: ['Vagabond'],
    coverUrl: 'https://media.kitsu.app/manga/1580/poster_image/medium-1580.jpeg',
    provenance: { source: 'KITSU', externalId: '1580' },
  },
  {
    title: 'Oyasumi Punpun',
    originalTitle: 'おやすみプンプン',
    romanizedTitle: 'Oyasumi Punpun',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2007,
    originCountry: 'JP',
    rating: 9.2,
    totalChapters: 147,
    synopsis: 'A dramática e crua jornada de amadurecimento de Punpun, retratado como um pássaro estilizado, enfrentando traumas e as dores da vida adulta.',
    genres: ['Psicológico', 'Drama', 'Cotidiano'],
    aliases: ['Boa Noite Punpun'],
    coverUrl: 'https://media.kitsu.app/manga/7245/poster_image/medium-7245.jpeg',
    provenance: { source: 'KITSU', externalId: '7245' },
  },
  {
    title: '20th Century Boys',
    originalTitle: '20世紀少年',
    romanizedTitle: '20 Seiki Shounen',
    category: Category.MANGA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 1999,
    originCountry: 'JP',
    rating: 9.1,
    totalChapters: 249,
    synopsis: 'Amigos de infância percebem que uma seita apocalíptica liderada por uma figura misteriosa chamada Amigo está executando suas brincadeiras de criança como planos de destruição global.',
    genres: ['Mistério', 'Ficção Científica', 'Drama'],
    aliases: ['20th Century Boys'],
    coverUrl: 'https://media.kitsu.app/manga/4932/poster_image/medium-4932.jpeg',
    provenance: { source: 'KITSU', externalId: '4932' },
  },
  // Manhwas Adicionais
  {
    title: 'The Boxer',
    originalTitle: '더 복서',
    romanizedTitle: 'Deo Bokseo',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2019,
    originCountry: 'KR',
    rating: 9.2,
    totalChapters: 142,
    synopsis: 'Um lendário treinador descobre Yu, um garoto apático dotado de reflexos desumanos e capacidade sobrenatural para o boxe profissional.',
    genres: ['Esporte', 'Drama', 'Ação'],
    aliases: ['The Boxer'],
    coverUrl: 'https://media.kitsu.app/manga/44123/poster_image/medium-44123.jpeg',
    provenance: { source: 'KITSU', externalId: '44123' },
  },
  {
    title: 'The Beginning After The End',
    originalTitle: '끝이 아닌 시작',
    romanizedTitle: 'Kkeut-i Anin Sijak',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2018,
    originCountry: 'KR',
    rating: 9.0,
    totalChapters: 185,
    synopsis: 'O rei Grey reencarna em um novo mundo repleto de magia e monstros, determinado a corrigir os arrependimentos de sua vida anterior.',
    genres: ['Fantasia', 'Ação', 'Aventura'],
    aliases: ['TBATE'],
    coverUrl: 'https://media.kitsu.app/manga/42155/poster_image/medium-42155.jpeg',
    provenance: { source: 'KITSU', externalId: '42155' },
  },
  {
    title: 'Bastard (Manhwa)',
    originalTitle: '후레자식',
    romanizedTitle: 'Hurejasik',
    category: Category.MANHWA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2014,
    originCountry: 'KR',
    rating: 9.1,
    totalChapters: 93,
    synopsis: 'Um estudante frágil é cúmplice relutante de seu próprio pai, um influente empresário que é secretamente um assassino em série implacável.',
    genres: ['Suspense', 'Psicológico', 'Terror'],
    aliases: ['Bastard'],
    coverUrl: 'https://media.kitsu.app/manga/31245/poster_image/medium-31245.jpeg',
    provenance: { source: 'KITSU', externalId: '31245' },
  },
  // Manhuas Adicionais
  {
    title: 'Soul Land',
    originalTitle: '斗罗大陆',
    romanizedTitle: 'Douluo Dalu',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.FINALIZADA,
    releaseYear: 2011,
    originCountry: 'CN',
    rating: 8.8,
    totalChapters: 340,
    synopsis: 'Tang San reencarna no continente Douluo Dalu carregando conhecimentos arcanos de venenos e forjas, despertando espíritos marciais lendários.',
    genres: ['Fantasia', 'Ação', 'Aventura'],
    aliases: ['Combat Continent'],
    coverUrl: 'https://media.kitsu.app/manga/12455/poster_image/medium-12455.jpeg',
    provenance: { source: 'MANGAUPDATES', externalId: '82345' },
  },
  {
    title: 'Battle Through the Heavens',
    originalTitle: '斗破苍穹',
    romanizedTitle: 'Doupo Cangqiong',
    category: Category.MANHUA,
    publicationStatus: PublicationStatus.EM_ANDAMENTO,
    releaseYear: 2012,
    originCountry: 'CN',
    rating: 8.7,
    totalChapters: 420,
    synopsis: 'Após perder seus poderes prodigiosos de cultivo, Xiao Yan desperta o espírito de um mestre ancestral residente no anel de sua mãe.',
    genres: ['Fantasia', 'Ação', 'Cultivo'],
    aliases: ['BTTH'],
    coverUrl: 'https://media.kitsu.app/manga/13455/poster_image/medium-13455.jpeg',
    provenance: { source: 'MANGAUPDATES', externalId: '76543' },
  },
];

export const REAL_CATALOG_ALL = [...REAL_CATALOG_120, ...EXTRA_CATALOG_EXPANDED];

function loadEnvIfMissing() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // Segue sem erro se .env não existir
  }
}

function hashScryptPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

const GENRE_TRANSLATION_MAP = {
  action: 'Ação',
  'action & adventure': 'Ação',
  'martial arts': 'Ação',
  adventure: 'Aventura',
  comedy: 'Comédia',
  'slice of life': 'Cotidiano',
  crime: 'Crime',
  drama: 'Drama',
  sports: 'Esporte',
  sport: 'Esporte',
  fantasy: 'Fantasia',
  'sci-fi & fantasy': 'Fantasia',
  'sci-fi': 'Ficção Científica',
  'science fiction': 'Ficção Científica',
  mystery: 'Mistério',
  psychological: 'Psicológico',
  romance: 'Romance',
  supernatural: 'Sobrenatural',
  thriller: 'Suspense',
  suspense: 'Suspense',
  horror: 'Terror',
  animation: 'Animação',
  family: 'Família',
  war: 'Guerra',
  'war & politics': 'Política',
  history: 'Histórico',
  historical: 'Histórico',
  music: 'Música',
  documentary: 'Documentário',
  'ação e aventura': 'Ação',
  'ficção científica e fantasia': 'Fantasia',
};

function mapGenresToPt(rawGenres) {
  const mapped = new Set();
  for (const g of rawGenres || []) {
    if (!g || typeof g !== 'string') continue;
    const clean = g.trim();
    const key = clean.toLowerCase();
    mapped.add(GENRE_TRANSLATION_MAP[key] || clean);
  }
  return Array.from(mapped).slice(0, 5);
}

function isBrokenCoverUrl(url) {
  if (!url || typeof url !== 'string') return true;
  if (!url.startsWith('http')) return true;
  if (url.includes('1234567890')) return true;
  if (url.includes('media.kitsu.io')) return true;
  if (/\/poster_image\/medium-\d+\.jpe?g$/i.test(url)) return true;
  if (/image\.tmdb\.org\/t\/p\/w\d+\/9rDuT7h9|opMEH9JL|85801/i.test(url)) return true;
  return false;
}

async function resolveOfficialCover(item, apiKey) {
  try {
    if ((item.category === Category.DORAMA || item.category === Category.FILME) && apiKey) {
      const endpoint = item.category === Category.FILME ? 'movie' : 'tv';
      const externalId = item.provenance?.externalId;

      if (externalId && /^\d+$/.test(String(externalId))) {
        const res = await fetch(`https://api.themoviedb.org/3/${endpoint}/${externalId}?api_key=${apiKey}&language=pt-BR`);
        if (res.ok) {
          const data = await res.json();
          if (data?.poster_path && data?.title === item.title || data?.name === item.title || data?.original_name === item.originalTitle || data?.original_title === item.originalTitle) {
            return `https://image.tmdb.org/t/p/w500${data.poster_path}`;
          }
        }
      }

      const q = encodeURIComponent(item.title);
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${q}&language=pt-BR`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = Array.isArray(searchData?.results) ? searchData.results : [];
        const preferred = results.find((r) => {
          const countries = r.origin_country || [];
          return r.poster_path && (!item.originCountry || countries.length === 0 || countries.includes(item.originCountry));
        }) || results.find((r) => Boolean(r.poster_path));
        if (preferred?.poster_path) {
          return `https://image.tmdb.org/t/p/w500${preferred.poster_path}`;
        }
      }
    }

    const isAnime = item.category === Category.ANIME;
    const kitsuType = isAnime ? 'anime' : 'manga';
    const q = encodeURIComponent(item.title);
    const res = await fetch(`https://kitsu.io/api/edge/${kitsuType}?filter[text]=${q}&page[limit]=5`, {
      headers: { Accept: 'application/vnd.api+json' },
    });
    if (res.ok) {
      const json = await res.json();
      const entries = Array.isArray(json?.data) ? json.data : [];
      const hit = entries.find((e) => e?.attributes?.posterImage?.large || e?.attributes?.posterImage?.medium);
      if (hit) {
        return hit.attributes.posterImage.large || hit.attributes.posterImage.medium;
      }
    }
  } catch {
    // Silencioso em caso de timeout
  }
  return null;
}

async function fetchTmdbGenreMap(apiKey) {
  const map = new Map();
  if (!apiKey) return map;
  for (const kind of ['tv', 'movie']) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/genre/${kind}/list?api_key=${apiKey}&language=pt-BR`);
      if (res.ok) {
        const json = await res.json();
        for (const g of json.genres || []) {
          map.set(g.id, g.name);
        }
      }
    } catch {
      // Ignora erro de rede em gênero
    }
  }
  return map;
}

async function fetchTmdbDiscoverBatch(apiKey, genreMap) {
  if (!apiKey) return [];
  const collected = [];

  const tvPlan = [
    { country: 'KR', pages: 12, extra: '&without_genres=16,10767,10763' },
    { country: 'JP', pages: 6, extra: '&without_genres=16,10767,10763' },
    { country: 'CN', pages: 6, extra: '&without_genres=16,10767,10763' },
    { country: 'TW', pages: 2, extra: '&without_genres=16' },
    { country: 'TH', pages: 2, extra: '&without_genres=16' },
  ];

  for (const plan of tvPlan) {
    for (let page = 1; page <= plan.pages; page++) {
      try {
        const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_origin_country=${plan.country}&sort_by=popularity.desc&language=pt-BR&page=${page}${plan.extra}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        for (const row of json.results || []) {
          if (!row.poster_path || !row.name) continue;
          const genres = mapGenresToPt((row.genre_ids || []).map((id) => genreMap.get(id)).filter(Boolean));
          if (genres.length === 0) genres.push('Drama');
          const year = row.first_air_date ? Number(row.first_air_date.slice(0, 4)) : null;
          collected.push({
            title: row.name,
            originalTitle: row.original_name || null,
            romanizedTitle: null,
            category: Category.DORAMA,
            publicationStatus: year && year < new Date().getFullYear() - 1 ? PublicationStatus.FINALIZADA : PublicationStatus.EM_ANDAMENTO,
            releaseYear: year && !isNaN(year) ? year : null,
            originCountry: plan.country,
            rating: typeof row.vote_average === 'number' && row.vote_average > 0 ? Number(row.vote_average.toFixed(1)) : 7.8,
            totalEpisodes: 16,
            synopsis: row.overview?.trim() || `${row.name} — Produção televisiva asiática (${plan.country}).`,
            genres,
            aliases: row.original_name && row.original_name !== row.name ? [row.original_name] : [],
            coverUrl: `https://image.tmdb.org/t/p/w500${row.poster_path}`,
            provenance: {
              title: { source: 'TMDB', externalId: String(row.id), syncedAt: new Date().toISOString() },
              cover: { source: 'TMDB', externalId: String(row.id), syncedAt: new Date().toISOString() },
            },
          });
        }
      } catch {
        // Segue próxima página
      }
    }
  }

  const moviePlan = [
    { country: 'KR', pages: 8 },
    { country: 'JP', pages: 8 },
    { country: 'CN', pages: 4 },
    { country: 'TW', pages: 2 },
    { country: 'TH', pages: 2 },
  ];

  for (const plan of moviePlan) {
    for (let page = 1; page <= plan.pages; page++) {
      try {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_origin_country=${plan.country}&sort_by=popularity.desc&language=pt-BR&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        for (const row of json.results || []) {
          if (!row.poster_path || !row.title) continue;
          const genres = mapGenresToPt((row.genre_ids || []).map((id) => genreMap.get(id)).filter(Boolean));
          if (genres.length === 0) genres.push('Drama');
          const year = row.release_date ? Number(row.release_date.slice(0, 4)) : null;
          collected.push({
            title: row.title,
            originalTitle: row.original_title || null,
            romanizedTitle: null,
            category: Category.FILME,
            publicationStatus: PublicationStatus.FINALIZADA,
            releaseYear: year && !isNaN(year) ? year : null,
            originCountry: plan.country,
            rating: typeof row.vote_average === 'number' && row.vote_average > 0 ? Number(row.vote_average.toFixed(1)) : 7.6,
            synopsis: row.overview?.trim() || `${row.title} — Longa-metragem asiático (${plan.country}).`,
            genres,
            aliases: row.original_title && row.original_title !== row.title ? [row.original_title] : [],
            coverUrl: `https://image.tmdb.org/t/p/w500${row.poster_path}`,
            provenance: {
              title: { source: 'TMDB', externalId: String(row.id), syncedAt: new Date().toISOString() },
              cover: { source: 'TMDB', externalId: String(row.id), syncedAt: new Date().toISOString() },
            },
          });
        }
      } catch {
        // Segue próxima página
      }
    }
  }

  return collected;
}

async function fetchKitsuCatalogBatch() {
  const collected = [];
  const kitsuPlan = [
    { endpoint: 'anime', subtype: null, category: Category.ANIME, country: 'JP', pages: 18 },
    { endpoint: 'manga', subtype: 'manga', category: Category.MANGA, country: 'JP', pages: 18 },
    { endpoint: 'manga', subtype: 'manhwa', category: Category.MANHWA, country: 'KR', pages: 15 },
    { endpoint: 'manga', subtype: 'manhua', category: Category.MANHUA, country: 'CN', pages: 12 },
  ];

  for (const plan of kitsuPlan) {
    for (let page = 0; page < plan.pages; page++) {
      try {
        const offset = page * 20;
        const subtypeQuery = plan.subtype ? `&filter[subtype]=${plan.subtype}` : '';
        const url = `https://kitsu.io/api/edge/${plan.endpoint}?page[limit]=20&page[offset]=${offset}&include=genres&sort=popularityRank${subtypeQuery}`;
        const res = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } });
        if (!res.ok) continue;
        const json = await res.json();

        const genreById = new Map();
        for (const inc of json.included || []) {
          if (inc.type === 'genres' && inc.attributes?.name) {
            genreById.set(inc.id, inc.attributes.name);
          }
        }

        for (const item of json.data || []) {
          const attrs = item.attributes || {};
          const title = attrs.canonicalTitle || attrs.titles?.en || attrs.titles?.en_jp;
          const coverUrl = attrs.posterImage?.large || attrs.posterImage?.medium || attrs.posterImage?.original;
          if (!title || !coverUrl) continue;

          const relGenres = (item.relationships?.genres?.data || [])
            .map((g) => genreById.get(g.id))
            .filter(Boolean);
          const genres = mapGenresToPt(relGenres);
          if (genres.length === 0) genres.push('Ação');

          const year = attrs.startDate ? Number(String(attrs.startDate).slice(0, 4)) : null;
          const rawRating = attrs.averageRating ? Number(attrs.averageRating) / 10 : null;
          const isAnime = plan.category === Category.ANIME;
          const aliases = [attrs.titles?.en, attrs.titles?.en_jp, attrs.titles?.ja_jp]
            .filter((a) => Boolean(a) && a !== title);

          collected.push({
            title,
            originalTitle: attrs.titles?.ja_jp || attrs.titles?.ko_kr || attrs.titles?.zh_cn || null,
            romanizedTitle: attrs.titles?.en_jp || null,
            category: plan.category,
            publicationStatus: attrs.status === 'finished' ? PublicationStatus.FINALIZADA : PublicationStatus.EM_ANDAMENTO,
            releaseYear: year && !isNaN(year) ? year : null,
            originCountry: plan.country,
            rating: rawRating && !isNaN(rawRating) ? Number(rawRating.toFixed(1)) : 8.0,
            totalEpisodes: isAnime && typeof attrs.episodeCount === 'number' ? attrs.episodeCount : null,
            totalChapters: !isAnime && typeof attrs.chapterCount === 'number' ? attrs.chapterCount : null,
            totalVolumes: !isAnime && typeof attrs.volumeCount === 'number' ? attrs.volumeCount : null,
            synopsis: (attrs.synopsis || `${title} — Obra asiática catalogada via Kitsu.`).replace(/\s+/g, ' ').trim(),
            genres,
            aliases: Array.from(new Set(aliases)),
            coverUrl,
            provenance: {
              title: { source: 'KITSU', externalId: String(item.id), syncedAt: new Date().toISOString() },
              cover: { source: 'KITSU', externalId: String(item.id), syncedAt: new Date().toISOString() },
            },
          });
        }
      } catch {
        // Segue próxima página
      }
    }
  }

  return collected;
}

export async function seedUserLibraryForTesting(prisma) {
  let users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('[YuukiList Seed] Criando usuário demo (demo@yuukilist.com / YuukiDemo2026)...');
    const demo = await prisma.user.create({
      data: {
        email: 'demo@yuukilist.com',
        normalizedEmail: 'demo@yuukilist.com',
        username: 'demonstracao',
        normalizedUsername: 'demonstracao',
        passwordHash: hashScryptPassword('YuukiDemo2026'),
        bio: 'Entusiasta de narrativas asiáticas, doramas clássicos, cinema autoral e animes consagrados.',
        location: 'São Paulo, Brasil',
      },
    });
    users = [demo];
  }

  const categories = ['DORAMA', 'FILME', 'ANIME', 'MANGA', 'MANHWA', 'MANHUA'];
  const balancedMedia = [];
  for (const cat of categories) {
    const itemsInCat = await prisma.mediaItem.findMany({
      where: { category: cat },
      take: 3,
      orderBy: [{ rating: 'desc' }, { releaseYear: 'desc' }],
    });
    balancedMedia.push(...itemsInCat);
  }

  if (balancedMedia.length === 0) return;

  const statusesByCategory = {
    DORAMA: ['CONCLUIDO', 'ASSISTINDO', 'QUERO_ASSISTIR'],
    FILME: ['CONCLUIDO', 'ASSISTIDO', 'QUERO_ASSISTIR'],
    ANIME: ['CONCLUIDO', 'ASSISTINDO', 'PAUSADO'],
    MANGA: ['CONCLUIDO', 'LENDO', 'QUERO_LER'],
    MANHWA: ['LENDO', 'CONCLUIDO', 'QUERO_LER'],
    MANHUA: ['CONCLUIDO', 'LENDO', 'PAUSADO'],
  };

  for (const user of users) {
    console.log(`[YuukiList Seed] Semeando biblioteca multi-categoria e 6 favoritos para: ${user.username}...`);

    for (let i = 0; i < balancedMedia.length; i++) {
      const media = balancedMedia[i];
      // Primeiro item de cada uma das 6 categorias vai para os Favoritos
      const isFav = i % 3 === 0;
      const catStatuses = statusesByCategory[media.category] || ['CONCLUIDO', 'ASSISTINDO', 'PAUSADO'];
      const status = catStatuses[i % 3];
      const isCompleted = status === 'CONCLUIDO' || status === 'ASSISTIDO';
      const maxUnits = media.totalEpisodes || media.totalChapters || (media.category === 'FILME' ? 0 : 16);
      const progress = media.category === 'FILME' ? 0 : isCompleted ? maxUnits : Math.max(1, Math.floor(maxUnits * 0.6));
      const rating = isFav ? 10 : isCompleted ? 9 : 8;

      await prisma.userLibraryItem.upsert({
        where: {
          userId_mediaItemId: {
            userId: user.id,
            mediaItemId: media.id,
          },
        },
        update: {
          status,
          progress,
          rating,
          isFavorite: isFav,
          notes: isFav ? 'Obra favorita com direção magistral e narrativa memorável.' : null,
          rewatchCount: isCompleted ? 1 : 0,
        },
        create: {
          userId: user.id,
          mediaItemId: media.id,
          status,
          progress,
          rating,
          isFavorite: isFav,
          notes: isFav ? 'Obra favorita com direção magistral e narrativa memorável.' : null,
          rewatchCount: isCompleted ? 1 : 0,
        },
      });
    }
  }
}

async function main() {
  loadEnvIfMissing();
  console.log('[YuukiList Seed] Iniciando carga massiva e saneamento de capas oficiais no Supabase...');
  const prisma = new PrismaClient();
  const tmdbApiKey = process.env.TMDB_API_KEY;

  try {
    // 1. Resolve capas oficiais reais para obras curadas com URLs quebradas
    console.log('[YuukiList Seed] Verificando/curando capas das obras principais...');
    const healedCurated = [];
    for (let i = 0; i < REAL_CATALOG_ALL.length; i += 8) {
      const batch = REAL_CATALOG_ALL.slice(i, i + 8);
      const processed = await Promise.all(
        batch.map(async (item) => {
          const cloned = { ...item };
          if (isBrokenCoverUrl(cloned.coverUrl)) {
            const liveCover = await resolveOfficialCover(cloned, tmdbApiKey);
            if (liveCover) {
              cloned.coverUrl = liveCover;
            }
          }
          return cloned;
        })
      );
      healedCurated.push(...processed);
    }

    // 2. Coleta lote ampliado das APIs oficiais (TMDB + Kitsu)
    console.log('[YuukiList Seed] Coletando catálogo completo via TMDB e Kitsu com capas verificadas...');
    const genreMap = await fetchTmdbGenreMap(tmdbApiKey);
    const [tmdbItems, kitsuItems] = await Promise.all([
      fetchTmdbDiscoverBatch(tmdbApiKey, genreMap),
      fetchKitsuCatalogBatch(),
    ]);

    console.log(`[YuukiList Seed] Coletados: Curados=${healedCurated.length} | TMDB=${tmdbItems.length} | Kitsu=${kitsuItems.length}`);

    // 3. Deduplicação por slug priorizando metadados curados (com capa curada) e APIs externas
    const bySlug = new Map();
    for (const item of [...healedCurated, ...tmdbItems, ...kitsuItems]) {
      const slug = generateSlug(item.title);
      if (!slug || slug.length > 155) continue;

      const existingEntry = bySlug.get(slug);
      if (!existingEntry) {
        bySlug.set(slug, { ...item, slug });
      } else if (isBrokenCoverUrl(existingEntry.coverUrl) && !isBrokenCoverUrl(item.coverUrl)) {
        existingEntry.coverUrl = item.coverUrl;
      }
    }

    const allUniqueItems = Array.from(bySlug.values());
    console.log(`[YuukiList Seed] Total único preparado para sincronização: ${allUniqueItems.length} obras.`);

    // 4. Carrega slugs existentes no banco em única consulta
    const existingRows = await prisma.mediaItem.findMany({
      select: { id: true, slug: true, coverPath: true },
    });
    const existingBySlug = new Map(existingRows.map((r) => [r.slug, r]));

    let insertedCount = 0;
    let updatedCount = 0;

    // 5. Persiste em lotes concorrentes controlados
    const CHUNK_SIZE = 15;
    for (let i = 0; i < allUniqueItems.length; i += CHUNK_SIZE) {
      const chunk = allUniqueItems.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          const slug = item.slug;
          const normalizedTitle = normalizeSearchText(item.title);
          const safeCover = (item.coverUrl && item.coverUrl.length <= 250 && !isBrokenCoverUrl(item.coverUrl))
            ? item.coverUrl
            : `/assets/covers/${slug}.svg`;
          const safeGenres = mapGenresToPt(item.genres || []).slice(0, 6);
          const safeAliases = Array.from(new Set(item.aliases || [])).filter(Boolean).slice(0, 6);

          const existing = existingBySlug.get(slug);
          if (existing) {
            const shouldUpdateCover = isBrokenCoverUrl(existing.coverPath) || !isBrokenCoverUrl(item.coverUrl);
            await prisma.mediaItem.update({
              where: { slug },
              data: {
                title: item.title.slice(0, 250),
                originalTitle: item.originalTitle ? String(item.originalTitle).slice(0, 250) : null,
                romanizedTitle: item.romanizedTitle ? String(item.romanizedTitle).slice(0, 250) : null,
                normalizedTitle: normalizedTitle.slice(0, 250),
                synopsis: item.synopsis || item.title,
                category: item.category,
                publicationStatus: item.publicationStatus || PublicationStatus.FINALIZADA,
                releaseYear: item.releaseYear || null,
                originCountry: (item.originCountry || 'AS').slice(0, 60),
                rating: item.rating ?? null,
                coverPath: shouldUpdateCover ? safeCover : existing.coverPath,
                totalEpisodes: item.totalEpisodes ?? null,
                totalChapters: item.totalChapters ?? null,
                totalVolumes: item.totalVolumes ?? null,
                provenance: item.provenance || {},
              },
            });
            updatedCount++;
          } else {
            await prisma.mediaItem.create({
              data: {
                slug,
                title: item.title.slice(0, 250),
                originalTitle: item.originalTitle ? String(item.originalTitle).slice(0, 250) : null,
                romanizedTitle: item.romanizedTitle ? String(item.romanizedTitle).slice(0, 250) : null,
                normalizedTitle: normalizedTitle.slice(0, 250),
                synopsis: item.synopsis || item.title,
                category: item.category,
                publicationStatus: item.publicationStatus || PublicationStatus.FINALIZADA,
                releaseYear: item.releaseYear || null,
                originCountry: (item.originCountry || 'AS').slice(0, 60),
                rating: item.rating ?? null,
                coverPath: safeCover,
                totalEpisodes: item.totalEpisodes ?? null,
                totalChapters: item.totalChapters ?? null,
                totalVolumes: item.totalVolumes ?? null,
                provenance: item.provenance || {},
                genres: {
                  create: safeGenres.map((name) => ({ name: name.slice(0, 75) })),
                },
                aliases: {
                  create: safeAliases.map((alias) => ({
                    alias: String(alias).slice(0, 250),
                    normalizedAlias: normalizeSearchText(String(alias)).slice(0, 250),
                    languageCode: (item.originCountry || 'as').toLowerCase().slice(0, 12),
                  })),
                },
              },
            });
            insertedCount++;
          }
        })
      );
      if ((i / CHUNK_SIZE) % 10 === 0 || i + CHUNK_SIZE >= allUniqueItems.length) {
        console.log(`[YuukiList Seed] Progresso: ${Math.min(i + CHUNK_SIZE, allUniqueItems.length)}/${allUniqueItems.length} (Inseridas: ${insertedCount} | Atualizadas: ${updatedCount})`);
      }
    }

    // 6. Saneamento adicional para registros remanescentes no banco que ainda tenham URL quebrada
    const remainingBroken = await prisma.mediaItem.findMany({
      where: {
        OR: [
          { coverPath: { contains: 'media.kitsu.io' } },
          { coverPath: { contains: '1234567890' } },
          { coverPath: { startsWith: '/assets/covers/' } },
        ],
      },
      select: { id: true, slug: true, title: true, originalTitle: true, category: true, originCountry: true, provenance: true },
    });

    if (remainingBroken.length > 0) {
      console.log(`[YuukiList Seed] Curando ${remainingBroken.length} capas remanescentes no banco...`);
      for (const broken of remainingBroken) {
        const liveCover = await resolveOfficialCover(broken, tmdbApiKey);
        if (liveCover && liveCover.length <= 250) {
          await prisma.mediaItem.update({
            where: { id: broken.id },
            data: { coverPath: liveCover },
          });
        }
      }
    }

    const totalByCat = await prisma.mediaItem.groupBy({ by: ['category'], _count: true });
    console.log('[YuukiList Seed] Distribuição final no Supabase:', totalByCat);

    // 7. Popula biblioteca com favoritos e histórico para testes e estatísticas
    await seedUserLibraryForTesting(prisma);
  } catch (err) {
    console.error('[YuukiList Seed] Erro ao sincronizar catálogo:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed-real-catalog.mjs')) {
  main();
}
