import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Printer, QrCode, FileText, ShieldCheck } from 'lucide-react';
import { BoletoPayment } from '../types/lottery';
import { sounds } from '../services/soundEffects';
import { PixConfig, DEFAULT_PIX_CONFIG, generatePixQrCodeDataUrl } from '../services/pixService';

interface BoletoModalProps {
  boleto: BoletoPayment | null;
  participantName: string;
  poolTitle: string;
  isOpen: boolean;
  pixConfig?: PixConfig;
  onClose: () => void;
  onMarkAsPaid?: () => void;
}

export const BoletoModal: React.FC<BoletoModalProps> = ({
  boleto,
  participantName,
  poolTitle,
  isOpen,
  pixConfig = DEFAULT_PIX_CONFIG,
  onClose,
  onMarkAsPaid,
}) => {
  const [copiedLinha, setCopiedLinha] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [activeTab, setActiveTab] = useState<'pix' | 'boleto'>('pix');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;
    if (boleto) {
      generatePixQrCodeDataUrl(pixConfig, boleto.amount, `BOLAO-${boleto.amount}`).then(
        (res) => {
          if (!isCancelled) {
            setQrCodeDataUrl(res.qrCodeDataUrl);
            setPixPayload(res.payload);
          }
        }
      );
    }
    return () => {
      isCancelled = true;
    };
  }, [boleto, pixConfig]);

  if (!isOpen || !boleto) return null;

  const handleCopyLinha = () => {
    sounds.playBallTap(500);
    navigator.clipboard.writeText(boleto.linhaDigitavel);
    setCopiedLinha(true);
    setTimeout(() => setCopiedLinha(false), 2500);
  };

  const handleCopyPix = () => {
    sounds.playBallTap(500);
    const codeToCopy = pixPayload || boleto.pixCopyPaste;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handlePrint = () => {
    sounds.playBallTap(500);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header - Caixa Blue Style */}
        <div className="bg-[#005CA9] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-black text-lg">
              X
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                Pagamento da Cota do Bolão
              </h3>
              <p className="text-xs text-blue-100">
                Caixa Econômica Federal · {poolTitle}
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

        {/* Tab switch between Pix and Boleto */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pix')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'pix'
                ? 'border-[#005CA9] text-[#005CA9]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Pix Instantâneo com QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('boleto')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'boleto'
                ? 'border-[#005CA9] text-[#005CA9]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Boleto Bancário Caixa</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">Sacado / Cotista</div>
              <div className="font-bold text-sm text-slate-900">{participantName}</div>
              <div className="text-xs text-slate-500 mt-0.5">Vencimento: {boleto.dueDate}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Valor Total da Cota</div>
              <div className="text-2xl font-black font-mono text-[#005CA9]">
                R$ {boleto.amount.toFixed(2)}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700">
                {boleto.status === 'pago' ? '✅ Pagamento Confirmado' : '⏳ Aguardando Pagamento'}
              </div>
            </div>
          </div>

          {activeTab === 'pix' ? (
            /* PIX SECTION */
            <div className="space-y-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block mx-auto">
                {/* Real Dynamic QR Code image */}
                <div className="w-52 h-52 bg-white border border-slate-300 rounded-lg p-2 mx-auto flex items-center justify-center shadow-sm">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code Pix Oficial"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Gerando QR Code Pix...
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  Beneficiário: <strong className="text-slate-900">{pixConfig.merchantName}</strong> · {pixConfig.merchantCity}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pix Copia e Cola (Chave Oficial do Bolão)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixPayload || boleto.pixCopyPaste}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-4 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar Pix'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* BOLETO SECTION */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Linha Digitável Caixa Econômica Federal (104)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={boleto.linhaDigitavel}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 select-all font-bold"
                  />
                  <button
                    onClick={handleCopyLinha}
                    className="px-4 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedLinha ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLinha ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Caixa Boleto Ticket Preview */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="font-extrabold text-sm text-[#005CA9] font-sans">
                    CAIXA | 104-0
                  </span>
                  <span className="text-slate-600 font-bold">{boleto.linhaDigitavel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Beneficiário:</span>
                    <div className="font-bold text-slate-900">{pixConfig.merchantName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Agência/Código Beneficiário:</span>
                    <div className="font-bold text-slate-900">0104 / 998822-1</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Data de Vencimento:</span>
                    <div className="font-bold text-slate-900">{boleto.dueDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Valor do Documento:</span>
                    <div className="font-bold text-slate-900">R$ {boleto.amount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-3 border-t border-slate-300 flex flex-col items-center">
                  <div className="flex gap-[2px] h-10 w-full max-w-sm justify-center items-stretch py-1">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full ${
                          i % 4 === 0 || i % 7 === 0 ? 'w-[3px] bg-slate-950' : 'w-[1.5px] bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500">{boleto.barcode}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pagável em qualquer banco, lotérica ou via Pix instantâneo</span>
          </div>

          <div className="flex items-center gap-2">
            {onMarkAsPaid && boleto.status !== 'pago' && (
              <button
                onClick={() => {
                  sounds.playWinChime();
                  onMarkAsPaid();
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Simular Pagamento Confirmado
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
