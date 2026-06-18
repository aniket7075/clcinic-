import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { EventEmitter } from 'events';

class WhatsAppService extends EventEmitter {
  private client: Client;
  private qrCodeDataUrl: string | null = null;
  private status: 'DISCONNECTED' | 'WAITING_FOR_QR' | 'CONNECTED' = 'DISCONNECTED';

  constructor() {
    super();
    // Using LocalAuth saves the session in .wwebjs_auth/ so we don't have to scan every time
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.initializeEvents();
  }

  private initializeEvents() {
    this.client.on('qr', async (qr) => {
      console.log('[WhatsApp] QR Code Received. Please scan to authenticate.');
      this.status = 'WAITING_FOR_QR';
      try {
        this.qrCodeDataUrl = await qrcode.toDataURL(qr);
        this.emit('qr', this.qrCodeDataUrl);
      } catch (err) {
        console.error('[WhatsApp] Failed to generate QR code data URL', err);
      }
    });

    this.client.on('ready', () => {
      console.log('[WhatsApp] Client is ready!');
      this.status = 'CONNECTED';
      this.qrCodeDataUrl = null;
      this.emit('ready');
    });

    this.client.on('authenticated', () => {
      console.log('[WhatsApp] Authenticated successfully!');
    });

    this.client.on('auth_failure', msg => {
      console.error('[WhatsApp] Authentication failure', msg);
      this.status = 'DISCONNECTED';
      this.qrCodeDataUrl = null;
    });

    this.client.on('disconnected', (reason) => {
      console.log('[WhatsApp] Client was disconnected', reason);
      this.status = 'DISCONNECTED';
      this.qrCodeDataUrl = null;
      this.emit('disconnected');
      
      // Attempt to restart
      setTimeout(() => {
        console.log('[WhatsApp] Attempting to reconnect...');
        this.client.initialize();
      }, 5000);
    });
  }

  public initialize() {
    console.log('[WhatsApp] Initializing client...');
    this.client.initialize();
  }

  public getStatus() {
    return {
      status: this.status,
      qrCodeUrl: this.qrCodeDataUrl
    };
  }

  /**
   * Formats a standard 10-digit number into WhatsApp ID format
   */
  private formatPhoneNumber(mobile: string) {
    let cleanMobile = mobile.replace(/\D/g, ''); // Remove non-digits
    
    // If it's a 10 digit Indian number, prepend 91
    if (cleanMobile.length === 10) {
      cleanMobile = '91' + cleanMobile;
    }
    
    return `${cleanMobile}@c.us`;
  }

  public async sendMessage(mobile: string, message: string): Promise<boolean> {
    if (this.status !== 'CONNECTED') {
      console.error(`[WhatsApp] Cannot send message to ${mobile}, client is not connected.`);
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(mobile);
      // Check if the number is registered on WhatsApp (optional but recommended)
      const isRegistered = await this.client.isRegisteredUser(formattedNumber);
      
      if (!isRegistered) {
        console.error(`[WhatsApp] Mobile ${mobile} is not registered on WhatsApp.`);
        return false;
      }

      await this.client.sendMessage(formattedNumber, message);
      console.log(`[WhatsApp] Sent message to ${mobile}`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send message to ${mobile}:`, error);
      return false;
    }
  }

  public async logout() {
    try {
      await this.client.logout();
      this.status = 'DISCONNECTED';
      this.qrCodeDataUrl = null;
      console.log('[WhatsApp] Logged out successfully');
    } catch (err) {
      console.error('[WhatsApp] Failed to logout', err);
    }
  }
}

// Export a singleton instance
export const whatsappService = new WhatsAppService();
