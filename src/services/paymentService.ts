import { BoletoPayment } from '../types/lottery';

// Generates realistic Caixa Econômica Federal (Bank 104) boleto barcode & linha digitável
export function generateCaixaBoleto(amount: number, participantName: string, poolTitle: string): BoletoPayment {
  const bankCode = '104'; // Caixa Econômica Federal
  const currencyCode = '9'; // Real

  // Factor based on due date (3 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  const dueDateStr = dueDate.toLocaleDateString('pt-BR');

  // Amount in cents formatted to 10 digits
  const amountCents = Math.round(amount * 100);
  const amountFormatted = String(amountCents).padStart(10, '0');

  // Realistic random sequence for Caixa convenio
  const randField1 = Math.floor(10000 + Math.random() * 90000);
  const randField2 = Math.floor(10000 + Math.random() * 90000);
  const randField3 = Math.floor(10000 + Math.random() * 90000);

  // Caixa Linha Digitável format: AAABC.CCCCX DDDDD.DDDDDY EEEEE.EEEEEZ K UUUUVVVVVVVVVV
  const campo1 = `${bankCode}${currencyCode}1.${randField1}`;
  const campo2 = `90000.${randField2}`;
  const campo3 = `10400.${randField3}`;
  const digitoVerificador = '9';
  const fatorVencimentoEValor = `9524${amountFormatted}`;

  const linhaDigitavel = `${campo1} ${campo2} ${campo3} ${digitoVerificador} ${fatorVencimentoEValor}`;
  const barcode = `${bankCode}${currencyCode}${digitoVerificador}9524${amountFormatted}${randField1}${randField2}${randField3}`;

  // Caixa Pix simulation code
  const pixCopyPaste = `00020126580014br.gov.bcb.pix0136caixa-bolao-${Math.random().toString(36).substring(2, 10)}@caixa.gov.br520400005303986540${amount.toFixed(2)}5802BR5925LOTERIAS CAIXA BOLAO6009BRASILIA62070503***6304ABCD`;

  return {
    barcode,
    linhaDigitavel,
    pixCopyPaste,
    dueDate: dueDateStr,
    amount,
    status: 'pendente',
  };
}
