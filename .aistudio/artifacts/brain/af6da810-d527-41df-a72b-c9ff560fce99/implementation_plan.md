# Plano de Implementação - Firebase, Senha Master, Pix QR Code e Modernização Visual

Este plano detalha a evolução do sistema para atender aos três pilares solicitados: banco de dados persistente no Google Firebase Firestore (ideal para publicação no Vercel/GitHub), autenticação de administrador com senha master, gerador de QR Code Pix oficial com chave configurável e modernização da barra superior sem barras de rolagem desnecessárias.

---

## 1. Banco de Dados Próprio no Google Firebase Firestore

### Objetivo
Permitir que os bolões, cotistas, dezenas depositadas e status de pagamento fiquem persistidos na nuvem de forma segura, possibilitando que o app seja publicado no Vercel, GitHub Pages ou qualquer hospedagem web.

### Estrutura de Coleções no Firestore
- `pools`:
  - `id`: identificador do bolão
  - `lotteryType`: `'megasena' | 'lotofacil' | 'quina'`
  - `title`, `targetContestNumber`, `targetContestDate`
  - `quotaPrice`, `totalQuotas`, `status`
  - `createdAt`, `updatedAt`
- `participants`:
  - `id`, `poolId`, `userId`, `name`, `email`, `phone`
  - `quotas`, `paid`, `chosenNumbers: number[]`
  - `boleto`, `pixCode`, `joinedAt`
- `tickets`:
  - `id`, `poolId`, `ticketNumber`, `numbers: number[]`
  - `cost`, `strategyUsed`, `confidenceScore`, `hits`, `prizeAmount`
- `settings`:
  - `id`: `'admin_config'`
  - `pixKeyType`: `'cpf' | 'cnpj' | 'email' | 'phone' | 'random'`
  - `pixKey`: string (ex: chave cadastrada pelo organizador)
  - `merchantName`: string (ex: 'RODRIGO BENTO')
  - `merchantCity`: string (ex: 'SAO PAULO')

---

## 2. Autenticação Administrativa com Senha "master"

### Requisitos
- Definir a credencial de organizador/admin protegida pela senha estrita **`master`**.
- Modal de login rápido para o Administrador:
  - Campo de Senha: validação direta de `master`.
  - Permissão exclusiva para:
    1. Criar e excluir bolões.
    2. Configurar a chave Pix oficial do organizador.
    3. Confirmar pagamentos de cotistas.
    4. Aplicar estratégias e gerar bilhetes finais.

---

## 3. Gestão de Chave Pix & Geração Automática de QR Code Real

### Requisitos
- Painel de Configurações Pix (exclusivo do Admin):
  - Tipo de Chave: CPF, CNPJ, E-mail, Celular ou Chave Aleatória (EVP).
  - Chave Pix do Organizador.
  - Nome do Titular da Conta (para exibição no app do banco do pagador).
  - Cidade do Titular.
- Gerador de Payload Pix Padrão BACEN (EMV Code):
  - Formatação oficial compatível com qualquer banco (Nubank, Caixa, Itaú, Bradesco, Inter, etc.).
  - Cálculo do dígito verificador CRC16.
  - Renderização do **QR Code real** (SVG/Canvas) e botão **Pix Copia e Cola**.
  - O valor do QR Code é ajustado automaticamente de acordo com o número de cotas do participante (ex: 1 cota = R$ 30,00; 2 cotas = R$ 60,00).

---

## 4. Modernização da Barra Superior & Símbolos Oficiais Caixa

### Requisitos
- **Eliminar barras de rolagem horizontais**:
  - Reorganizar a navegação em um menu superior compacto, responsivo e adaptativo (desktop e mobile).
  - Agrupamento inteligente de abas essenciais:
    - **Visão Geral**
    - **Simulador Matemático**
    - **Participantes & Volante**
    - **Bilhetes & Apostas**
    - **Conferidor Oficial**
- **Símbolos e Identidade Visual das Loterias Caixa**:
  - Trevo/Quadrante verde para **Mega-Sena**.
  - Matriz 15 pontos roxa para **Lotofácil**.
  - Estrela/Dados azuis para **Quina**.
  - Design clean em branco e azul Caixa (`#005CA9`), com tipografia moderna e cards organizados.

---

## 5. Roteiro de Execução

1. **Passo 1 (Firebase Provisioning)**: Abrir modal de setup do Firebase para aceite dos termos e provisionamento do Firestore.
2. **Passo 2 (SDK & Segurança)**: Configurar `firebase.ts`, `firebase-blueprint.json` e `firestore.rules`.
3. **Passo 3 (Pix Generator)**: Implementar utilitário EMV BR Code BACEN com renderizador dinâmico de QR Code.
4. **Passo 4 (Senha Master & Painel Admin)**: Ajustar validação de admin para `master` e criar tela de configuração de chave Pix.
5. **Passo 5 (Design Top Bar & Ícones)**: Atualizar o Header e LotterySelector com layout sem rolagem e símbolos oficiais.
6. **Passo 6 (Validação)**: Executar `lint_applet` e `compile_applet` para garantir compilação limpa.
