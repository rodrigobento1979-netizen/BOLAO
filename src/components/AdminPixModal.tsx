import React, { useState, useEffect } from 'react';
import { X, QrCode, Check, Save, Sparkles, Building2, User, Key, MapPin } from 'lucide-react';
import { PixConfig, generatePixQrCodeDataUrl } from '../services/pixService';
import { sounds } from '../services/soundEffects';

interface AdminPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: PixConfig;
  onSaveConfig: (newConfig: PixConfig) => void;
}

export const AdminPixModal: React.FC<AdminPixModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [keyType, setKeyType] = useState<PixConfig['keyType']>(currentConfig.keyType);
  const [key, setKey] = useState(currentConfig.key);
  const [merchantName, setMerchantName] = useState(currentConfig.merchantName);
  const [merchantCity, setMerchantCity] = useState(currentConfig.merchantCity);

  const [previewQrCode, setPreviewQrCode] = useState<string>('');
  const [previewPayload, setPreviewPayload] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Update preview whenever fields change
  useEffect(() => {
    let isCancelled = false;
    const updatePreview = async () => {
      if (!key.trim()) return;
      setIsGenerating(true);
      const res = await generatePixQrCodeDataUrl(
        { keyType, key, merchantName, merchantCity },
        30.0, // Example test quota amount
        'BOLAO-TESTE'
      );
      if (!isCancelled) {
        setPreviewQrCode(res.qrCodeDataUrl);
        setPreviewPayload(res.payload);
        setIsGenerating(false);
      }
    };
    updatePreview();
    return () => {
      isCancelled = true;
    };
  }, [keyType, key, merchantName, merchantCity]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    sounds.playWinChime();
    const newConfig: PixConfig = {
      keyType,
      key: key.trim(),
      merchantName: merchantName.trim().toUpperCase() || 'ORGANIZADOR',
      merchantCity: merchantCity.trim().toUpperCase() || 'BRASILIA',
    };

    onSaveConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Caixa Blue */}
        <div className="bg-[#005CA9] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Configurar Chave Pix do Organizador</h3>
              <p className="text-xs text-blue-100">
                Geração de QR Code dinâmico padrão BACEN para recebimento de cotas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Chave Pix configurada e salva com sucesso no Firestore!</span>
            </div>
          )}

          {/* Key Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tipo de Chave Pix
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'cpf', label: 'CPF' },
                { id: 'cnpj', label: 'CNPJ' },
                { id: 'email', label: 'E-mail' },
                { id: 'phone', label: 'Celular' },
                { id: 'random', label: 'Aleatória' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setKeyType(t.id as any)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all border ${
                    keyType === t.id
                      ? 'bg-[#005CA9] text-white border-[#005CA9]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pix Key Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chave Pix do Organizador *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder={
                  keyType === 'email'
                    ? 'exemplo@gmail.com'
                    : keyType === 'cpf'
                    ? '123.456.789-00'
                    : keyType === 'phone'
                    ? '+5511987654321'
                    : 'Digite a chave'
                }
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merchant Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Titular (Até 25 letras) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="RODRIGO BENTO"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] uppercase"
                />
              </div>
            </div>

            {/* Merchant City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cidade da Conta (Até 15 letras) *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="SAO PAULO"
                  value={merchantCity}
                  onChange={(e) => setMerchantCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] uppercase"
                />
              </div>
            </div>
          </div>

          {/* Live QR Code Preview Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 h-32 bg-white border border-slate-300 rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
              {previewQrCode ? (
                <img
                  src={previewQrCode}
                  alt="QR Code Pix"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400 text-center">
                  Digite a chave para gerar
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pré-visualização do QR Code Dinâmico</span>
              </span>
              <p>
                Qualquer participante que abrir a cota verá este QR Code atualizado com o valor exato de suas cotas para pagamento imediato no app do banco.
              </p>
              <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs pt-1">
                BR Code: {previewPayload.slice(0, 38)}...
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Chave Pix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
