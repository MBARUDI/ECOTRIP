
import React, { useState, useMemo, useEffect } from 'react';
import { Leaf, MapPin, Navigation, Info, Share2, Trees, DollarSign, CheckCircle2, FileDown } from 'lucide-react';
import { TransportMode, CalculationResult } from './types';
import { EMISSION_FACTORS, CARBON_CREDIT_PRICE_PER_TON } from './constants';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [origin, setOrigin] = useState('Foz do Iguaçu, PR');
  const [destination, setDestination] = useState('Juiz de Fora, MG');
  const [distanceInput, setDistanceInput] = useState<string>('1000');
  const [selectedMode, setSelectedMode] = useState<TransportMode>(TransportMode.CAR);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const distance = parseFloat(distanceInput) || 0;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const results: CalculationResult = useMemo(() => {
    const factor = EMISSION_FACTORS.find(f => f.mode === selectedMode)?.kgCo2PerKm || 0;
    const totalCo2 = distance * factor;
    const carbonCredits = totalCo2 / 1000;
    const cost = carbonCredits * CARBON_CREDIT_PRICE_PER_TON;

    const comparisons = EMISSION_FACTORS.map(f => {
      const modeEmission = distance * f.kgCo2PerKm;
      const refEmission = totalCo2 === 0 ? 1 : totalCo2;
      return {
        mode: f.mode,
        emission: modeEmission,
        percentageDiff: (modeEmission / refEmission) * 100
      };
    });

    return {
      distance,
      totalCo2,
      carbonCredits,
      cost,
      comparisons
    };
  }, [distance, selectedMode]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Estilos Básicos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(22, 101, 52); // Verde escuro
    doc.text("Relatório de Impacto Ambiental - EcoTrip", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Detalhes da Viagem
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Detalhes da Viagem", 20, 45);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Origem: ${origin}`, 20, 55);
    doc.text(`Destino: ${destination}`, 20, 62);
    doc.text(`Distância: ${distance.toLocaleString('pt-BR')} km`, 20, 69);
    doc.text(`Meio de Transporte: ${selectedMode}`, 20, 76);
    
    // Resultados de Impacto
    doc.setFont("helvetica", "bold");
    doc.text("Impacto Ambiental", 20, 90);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Emissão de CO2: ${results.totalCo2.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`, 20, 100);
    doc.text(`Créditos de Carbono: ${results.carbonCredits.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}`, 20, 107);
    doc.text(`Investimento para Compensação: R$ ${results.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 114);
    
    // Comparativo
    doc.setFont("helvetica", "bold");
    doc.text("Comparativo com outros modais", 20, 130);
    
    let yPos = 140;
    results.comparisons.forEach((comp) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${comp.mode}: ${comp.emission.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg CO2`, 20, yPos);
      yPos += 7;
    });
    
    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("EcoTrip - Viajando consciente por um futuro mais verde.", 20, 280);
    
    doc.save(`Relatorio_EcoTrip_${origin.split(',')[0]}_${destination.split(',')[0]}.pdf`);
    
    setIsSuccess(true);
    setToastMessage('PDF gerado com sucesso! 📄');
    setShowToast(true);
  };

  const handleShare = async () => {
    const shareText = `🌱 *Meu Relatório EcoTrip* 🌍
    
📍 De: ${origin}
🏁 Para: ${destination}
📏 Distância: ${distance.toLocaleString('pt-BR')} km
🚗 Transporte: ${selectedMode}

📉 *Impacto Ambiental:*
💨 Emissão de CO₂: ${results.totalCo2.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
🌳 Créditos de Carbono: ${results.carbonCredits.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
💰 Investimento Verde: R$ ${results.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Calculei meu impacto ambiental com a EcoTrip! Vamos viajar de forma consciente? 🍃`;

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Meu Relatório EcoTrip',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error(err);
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setIsSuccess(true);
      setToastMessage('Relatório copiado com sucesso! 🚀');
      setShowToast(true);
    } catch (err) {
      setIsSuccess(false);
      setToastMessage('Erro ao copiar relatório.');
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      {/* Toast Feedback */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${isSuccess ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
            {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2 text-green-700">
          <Leaf className="w-8 h-8 fill-green-600" />
          <h1 className="text-3xl font-extrabold tracking-tight">EcoTrip</h1>
        </div>
        <p className="text-gray-600 max-w-lg mx-auto font-medium">
          Simulador de Impacto Ambiental e Compensação de CO₂
        </p>
      </header>

      {/* Input Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-green-100">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                <MapPin className="w-4 h-4 text-green-600" /> Origem
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-900 font-semibold"
                placeholder="Ex: São Paulo, SP"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                <Navigation className="w-4 h-4 text-green-600" /> Destino
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-900 font-semibold"
                placeholder="Ex: Rio de Janeiro, RJ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Distância da Viagem (km)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-900 font-black text-xl"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-black tracking-widest text-sm uppercase">
                km
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-widest">Meio de Transporte</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {EMISSION_FACTORS.map((factor) => (
                <button
                  key={factor.mode}
                  onClick={() => setSelectedMode(factor.mode)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                    selectedMode === factor.mode
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-105 z-10'
                      : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{factor.icon}</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold">{factor.mode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-50 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Leaf className="w-64 h-64 text-green-900 rotate-12" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">Pegada de Carbono</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-green-600 tabular-nums">
                  {results.totalCo2.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                </span>
                <span className="text-xl font-bold text-green-800">kg CO₂</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-black mb-1">Trajeto</p>
                <p className="text-lg font-black text-gray-800 tabular-nums">{distance.toLocaleString('pt-BR')} km</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-black mb-1">Modal</p>
                <p className="text-lg font-black text-gray-800 flex items-center gap-2 truncate">
                  {EMISSION_FACTORS.find(f => f.mode === selectedMode)?.icon} {selectedMode}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-green-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trees className="w-6 h-6" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Sugestão de Compensação</h3>
            </div>
            <p className="text-4xl font-black mb-1 tabular-nums">
              {results.carbonCredits.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
            </p>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-6">Créditos de Carbono</p>
            <div className="pt-5 border-t border-white/20 flex justify-between items-center">
              <span className="text-xs font-black opacity-90 uppercase tracking-tighter">Investimento Verde</span>
              <span className="text-2xl font-black tabular-nums">R$ {results.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleShare}
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-6 rounded-3xl transition-all shadow-2xl hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs group"
          >
            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Compartilhar Relatório
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-6 rounded-3xl transition-all shadow-2xl hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs group"
          >
            <FileDown className="w-5 h-5 group-hover:bounce transition-transform" />
            Salvar em PDF
          </button>
        </div>
      </div>

      <footer className="mt-20 text-center pb-12">
        <div className="flex justify-center gap-6 mb-6 opacity-20">
          <Leaf className="w-5 h-5" />
          <Trees className="w-5 h-5" />
          <Navigation className="w-5 h-5" />
        </div>
        <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.5em] mb-2">
          EcoTrip Framework v2.2
        </p>
      </footer>
    </div>
  );
};

export default App;
