import QRCode from 'qrcode';

export interface PixConfig {
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  key: string;
  merchantName: string;
  merchantCity: string;
}

export const DEFAULT_PIX_CONFIG: PixConfig = {
  keyType: 'email',
  key: 'rodrigobento1979@gmail.com',
  merchantName: 'RODRIGO BENTO',
  merchantCity: 'SAO PAULO',
};

// Formats an EMV tag: ID (2 chars) + Length (2 chars) + Value
function formatEMV(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

// CRC16 CCITT computation for standard Brazilian Pix BR Code
function computeCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    const byte = payload.charCodeAt(i);
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Generates real BACEN compliant Pix "Copia e Cola" string
export function generatePixPayload(
  config: PixConfig,
  amount: number,
  transactionId: string = 'BOLAO'
): string {
  // Normalize fields according to BACEN standard
  const cleanKey = config.key.trim();
  const cleanName = (config.merchantName || 'ORGANIZADOR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);
  const cleanCity = (config.merchantCity || 'BRASILIA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);
  const cleanTxId = transactionId.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || 'BOLAO';

  // Merchant Account Information (Tag 26)
  const gui = formatEMV('00', 'br.gov.bcb.pix');
  const keyField = formatEMV('01', cleanKey);
  const merchantAccountInfo = formatEMV('26', `${gui}${keyField}`);

  // Base payload without CRC
  let payload =
    formatEMV('00', '01') + // Format indicator
    formatEMV('01', '12') + // Point of initiation (Dynamic with amount)
    merchantAccountInfo +
    formatEMV('52', '0000') + // Merchant category
    formatEMV('53', '986') + // Currency: BRL
    formatEMV('54', amount.toFixed(2)) + // Transaction amount
    formatEMV('58', 'BR') + // Country code
    formatEMV('59', cleanName) + // Merchant name
    formatEMV('60', cleanCity) + // Merchant city
    formatEMV('62', formatEMV('05', cleanTxId)) + // Additional data / Reference
    '6304'; // CRC placeholder

  const crc = computeCRC16(payload);
  return `${payload}${crc}`;
}

// Generates QR Code Data URL image (PNG base64) for display
export async function generatePixQrCodeDataUrl(
  config: PixConfig,
  amount: number,
  transactionId: string = 'BOLAO'
): Promise<{ payload: string; qrCodeDataUrl: string }> {
  const payload = generatePixPayload(config, amount, transactionId);
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#004889',
        light: '#FFFFFF',
      },
    });
    return { payload, qrCodeDataUrl };
  } catch {
    return { payload, qrCodeDataUrl: '' };
  }
}
