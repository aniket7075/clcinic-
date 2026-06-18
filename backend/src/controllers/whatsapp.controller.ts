import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';

export const getWhatsAppStatus = (req: Request, res: Response): void => {
  const statusInfo = whatsappService.getStatus();
  res.status(200).json(statusInfo);
};

export const logoutWhatsApp = async (req: Request, res: Response): Promise<void> => {
  try {
    await whatsappService.logout();
    res.status(200).json({ message: 'Logged out successfully', status: 'DISCONNECTED' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
};
