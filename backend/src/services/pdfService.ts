interface AgreementPDFData {
  bookingNumber: string;
  customerName: string;
  agreementContent: string;
  signatureData: string;
  signedAt: Date;
}

export async function generateAgreementPDF(data: AgreementPDFData): Promise<Buffer> {
  // In production, use @react-pdf/renderer or Puppeteer
  // For now, return a placeholder buffer
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rental Agreement - ${data.bookingNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #1a1a2e; }
        .signature { margin-top: 40px; }
        .signature img { max-width: 200px; }
      </style>
    </head>
    <body>
      <h1>Dump Trailer Rental Agreement</h1>
      <p><strong>Booking Number:</strong> ${data.bookingNumber}</p>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Signed:</strong> ${data.signedAt.toISOString()}</p>
      <hr />
      ${data.agreementContent}
      <div class="signature">
        <p><strong>Signature:</strong></p>
        <img src="${data.signatureData}" alt="Signature" />
      </div>
    </body>
    </html>
  `;

  // For now, return HTML as buffer
  return Buffer.from(html);
}
