import React from 'react';
import { X, Bell, CheckCircle2, QrCode, FileText, Share2, Sparkles } from 'lucide-react';
import { PoolNotification } from '../types/lottery';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import { sounds } from '../services/soundEffects';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PoolNotification[];
  onOpenPool: (poolId: string) => void;
  onOpenMyBoleto: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onOpenPool,
  onOpenMyBoleto,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Caixa Blue */}
        <div className="bg-[#005CA9] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Notificações dos Bolões Caixa</h3>
              <p className="text-xs text-blue-100">
                Avisos de novos bolões abertos, boletos emitidos e convocações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              Nenhuma notificação recente. Quando o administrador abrir um novo bolão, o aviso aparecerá aqui automaticamente!
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = LOTTERIES_CONFIG[n.lotteryType];
              return (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cfg?.accentColor || '#005CA9' }}
                      />
                      <span className="font-bold text-xs text-[#005CA9]">
                        {n.poolTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {n.message}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Boleto & Pix Disponíveis (R$ {n.quotaPrice.toFixed(2)} / cota)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sounds.playBallTap(500);
                          onOpenMyBoleto();
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-blue-50 text-slate-800 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#005CA9]" />
                        <span>Ver Boleto</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playBallTap(500);
                          onOpenPool(n.poolId);
                          onClose();
                        }}
                        className="px-3 py-1 bg-[#005CA9] hover:bg-[#004889] text-white rounded text-xs font-bold transition-colors"
                      >
                        Entrar no Bolão
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
