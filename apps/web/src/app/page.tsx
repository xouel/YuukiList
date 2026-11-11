import React from 'react';
import { redirect } from 'next/navigation';
import { HomeHubView } from '../components/home/home-hub-view.tsx';

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export const metadata = {
  title: 'YuukiList — Início & Painel de Acompanhamento',
  description: 'Acompanhe seus doramas, animes e mangás em andamento com progresso tátil e recomendações da temporada.',
};

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;

  // Redireciona consultas de busca legadas diretamente para a rota /explore
  if (searchParams && (searchParams.q || searchParams.category || searchParams.country || searchParams.theme || searchParams.status)) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams)) {
      if (typeof val === 'string') {
        params.set(key, val);
      } else if (Array.isArray(val) && val[0]) {
        params.set(key, val[0]);
      }
    }
    redirect(`/explore?${params.toString()}`);
  }

  return <HomeHubView />;
}
