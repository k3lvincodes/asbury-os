export interface Agreement {
  id: string;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SignedAgreement {
  id: string;
  reservationId: string;
  agreementId: string;
  customerName: string;
  signatureData: string;
  acceptedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  pdfUrl?: string;
  createdAt: Date;
}
