import React from 'react';
import { CatalogView } from '../../components/catalog/catalog-view.tsx';

export const metadata = {
  title: 'Explorar Catálogo — YuukiList',
  description: 'Catálogo unificado de doramas, filmes, animes, mangás, manhwas e manhuas com filtros avançados.',
};

export default function ExplorePage() {
  return <CatalogView />;
}

