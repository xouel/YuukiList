import React from 'react';

/**
 * YuukiList — Rodapé de Atribuição Legal e Proveniência de Dados
 * Conforme Seções 9.3, 9.4, 9.6, 9.7 e 11.1 do Documento Mestre de Contexto
 */

export function LegalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1E2337] bg-[#0A0D16]/60 text-[#64748B] py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Identidade e Soberania */}
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-white">YUUKILIST</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181C2B] text-[#06B6D4] font-medium border border-[#262C3F]">
              Soberania de Dados & R$ 0
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Plataforma unificada de acompanhamento e catálogo de entretenimento asiático.
          </p>
          <p className="text-[11px] text-[#64748B]">
            © {currentYear} YuukiList. Capas locais vetoriais geradas internamente. Sem player de vídeo ou leitor pirata.
          </p>
        </div>

        {/* Atribuição Obrigatória das APIs Parceiras */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right max-w-md">
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Este produto utiliza dados das APIs públicas do{' '}
            <strong className="text-[#CBD5E1]">TMDB</strong>,{' '}
            <strong className="text-[#CBD5E1]">TVmaze</strong>,{' '}
            <strong className="text-[#CBD5E1]">Kitsu</strong>,{' '}
            <strong className="text-[#CBD5E1]">Anime News Network</strong> e{' '}
            <strong className="text-[#CBD5E1]">MangaUpdates</strong>.
          </p>
          <p className="text-[10px] text-[#64748B] italic">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}

