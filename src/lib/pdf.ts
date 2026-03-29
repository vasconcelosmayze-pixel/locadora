import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, MotoModel, MOTO_NAMES, MOTO_PRICES } from '../types';

const SHOP_NAME = 'JUAN MOTOS - ALUGUEL DE MOTOS';
const SHOP_ADDRESS = 'Avenida BH1 Nlolo Pereira Centro em frente ao comercial Bom Motivo';
const SHOP_PHONE = '(92) 99519-7573';

export const generateContractPDF = (customer: Partial<Customer>, moto?: MotoModel, customPrice?: number) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-BR');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(227, 30, 36); // Brand Red
  doc.text('JUAN MOTOS', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('ALUGUEL DE MOTOS', 105, 28, { align: 'center' });
  doc.text(SHOP_ADDRESS, 105, 34, { align: 'center' });
  doc.text(`WhatsApp: ${SHOP_PHONE}`, 105, 40, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATO DE LOCAÇÃO DE VEÍCULO', 105, 55, { align: 'center' });

  // Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('DADOS DO LOCATÁRIO:', 20, 70);
  
  autoTable(doc, {
    startY: 75,
    body: [
      ['Nome:', customer.name || 'N/A'],
      ['RG:', customer.rg || 'N/A'],
      ['CPF:', customer.cpf || 'N/A'],
      ['Telefone:', customer.phone || 'N/A'],
      ['Endereço:', customer.address || 'N/A'],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
  });

  // Rental Info
  if (moto) {
    const finalY = (doc as any).lastAutoTable.finalY || 75;
    const price = customPrice !== undefined ? customPrice : MOTO_PRICES[moto];
    doc.text('DADOS DA LOCAÇÃO:', 20, finalY + 10);
    autoTable(doc, {
      startY: finalY + 15,
      body: [
        ['Veículo:', MOTO_NAMES[moto]],
        ['Valor da Diária:', `R$ ${price},00`],
        ['Período:', 'Manhã até as 18:00h'],
        ['Data:', dateStr],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [227, 30, 36] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });
  }

  // Terms
  const finalY2 = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMOS E CONDIÇÕES:', 20, finalY2 + 15);
  
  doc.setFont('helvetica', 'normal');
  const terms = [
    '1. O LOCATÁRIO é inteiramente responsável por danos ao veículo e infrações de trânsito.',
    '2. O veículo deve ser devolvido impreterivelmente até as 18:00h do dia corrente.',
    '3. O veículo deve ser devolvido com a mesma quantidade de combustível.',
    '4. Em caso de furto ou roubo, o LOCATÁRIO deverá ressarcir o valor integral do veículo.',
    '5. É proibido o uso do veículo por terceiros não autorizados neste contrato.'
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, 20, finalY2 + 25 + (index * 7), { maxWidth: 170 });
  });

  // Signatures
  const finalY3 = finalY2 + 70;
  doc.line(20, finalY3 + 20, 90, finalY3 + 20);
  doc.text('Assinatura do Locatário', 55, finalY3 + 25, { align: 'center' });
  
  doc.line(120, finalY3 + 20, 190, finalY3 + 20);
  doc.text('Assinatura Juan Motos', 155, finalY3 + 25, { align: 'center' });

  doc.save(`contrato_${customer.name?.replace(/\s+/g, '_') || 'cliente'}.pdf`);
};

export const generateReceiptPDF = (customerName: string, value: string, description: string) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-BR');

  // Border
  doc.setDrawColor(227, 30, 36);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 100);

  // Header
  doc.setFontSize(24);
  doc.setTextColor(227, 30, 36);
  doc.text('RECIBO', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('JUAN MOTOS - ALUGUEL DE MOTOS', 105, 40, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(SHOP_ADDRESS, 105, 46, { align: 'center' });
  doc.text(`WhatsApp: ${SHOP_PHONE}`, 105, 52, { align: 'center' });

  // Body
  doc.setFontSize(12);
  doc.text(`Recebemos de: ${customerName}`, 20, 70);
  doc.text(`A quantia de: R$ ${value}`, 20, 80);
  doc.text(`Referente a: ${description}`, 20, 90);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Data: ${dateStr}`, 150, 100);

  // Signature
  doc.line(60, 105, 150, 105);
  doc.setFontSize(10);
  doc.text('Assinatura Responsável Juan Motos', 105, 110, { align: 'center' });

  doc.save(`recibo_${customerName.replace(/\s+/g, '_')}.pdf`);
};
