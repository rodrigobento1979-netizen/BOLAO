import React, { useState } from 'react';
import { X, User, Mail, Phone, CheckCircle2, Shield } from 'lucide-react';
import { RegisteredUser } from '../types/lottery';
import { sounds } from '../services/soundEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: RegisteredUser) => void;
  currentUser: RegisteredUser | null;
  defaultRole?: 'admin' | 'participant';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  defaultRole = 'admin',
}) => {
  const [role, setRole] = useState<'participant' | 'admin'>(defaultRole);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor preencha seu nome para identificação.');
      return;
    }

    sounds.playBallTap(650);

    const user: RegisteredUser = {
      id: currentUser?.id || `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase() || 'participante@bolao.com.br',
      phone: phone.trim() || '(11) 99999-9999',
      role,
      registeredAt: new Date().toISOString(),
    };

    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header Caixa Blue */}
        <div className="bg-[#005CA9] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-base">Identificação do Usuário</h3>
              <p className="text-xs text-blue-100">
                Acesso 100% público · Sem necessidade de senhas
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role selector */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                role === 'admin'
                  ? 'bg-white text-[#005CA9] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#005CA9]" />
              <span>Organizador / Criador</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('participant');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                role === 'participant'
                  ? 'bg-white text-[#005CA9] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cotista / Apostador
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seu Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Ex: Rodrigo Bento"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Único campo obrigatório. Aparecerá nas cotas e nos bilhetes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail (Opcional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                placeholder="Ex: seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefone / WhatsApp (Opcional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-blue-900/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar e Continuar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
