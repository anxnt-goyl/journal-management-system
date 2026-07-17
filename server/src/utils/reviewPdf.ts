import PDFDocument from 'pdfkit';

interface ReviewReportInput {
  paperTitle: string;
  reviewerName: string;
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  originalityRating: number;
  methodologyRating: number;
  significanceRating: number;
  commentsForAuthor: string;
  commentsForEditor: string;
  submittedAt: Date;
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  accept: 'Accept',
  minor_revision: 'Accept with Minor Revisions',
  major_revision: 'Major Revisions Required',
  reject: 'Reject',
};

function drawStarRow(doc: PDFKit.PDFDocument, label: string, rating: number) {
  doc.font('Helvetica-Bold').fontSize(10).text(label, { continued: true });
  doc.font('Helvetica').text(`  ${rating} / 5`);
}

/**
 * Renders a one-page-ish PDF summarizing a single peer review: ratings,
 * recommendation, feedback for the author, and confidential remarks for the
 * editor. Returns a Buffer ready to upload.
 */
export function generateReviewReportPdf(input: ReviewReportInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 56 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#1f2d3d')
        .text('Peer Review Report', { align: 'left' });

      doc
        .moveDown(0.3)
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#666666')
        .text('Journal of Modern Science — Confidential Editorial Document', { align: 'left' });

      doc.moveDown(1);
      doc
        .strokeColor('#dddddd')
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(1);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11).text('Manuscript');
      doc.font('Helvetica').fontSize(10).text(input.paperTitle);
      doc.moveDown(0.8);

      doc.font('Helvetica-Bold').fontSize(11).text('Reviewer');
      doc.font('Helvetica').fontSize(10).text(input.reviewerName);
      doc.moveDown(0.8);

      doc.font('Helvetica-Bold').fontSize(11).text('Submitted');
      doc.font('Helvetica').fontSize(10).text(input.submittedAt.toUTCString());
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(11).text('Academic Score Matrix');
      doc.moveDown(0.3);
      drawStarRow(doc, 'Mathematical / Scientific Originality:', input.originalityRating);
      drawStarRow(doc, 'Methodological Rigor:', input.methodologyRating);
      drawStarRow(doc, 'Practical Significance:', input.significanceRating);
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(11).text('Overall Recommendation');
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#1a4d8f')
        .text(RECOMMENDATION_LABELS[input.recommendation] || input.recommendation);
      doc.fillColor('#000000');
      doc.moveDown(1);

      doc.font('Helvetica-Bold').fontSize(11).text('Comments & Constructive Feedback for Authors');
      doc.font('Helvetica').fontSize(10).text(input.commentsForAuthor || '(none provided)', {
        align: 'justify',
      });
      doc.moveDown(1);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#8a3324')
        .text('Confidential Editorial Remarks (Editor-in-Chief only)');
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000000')
        .text(input.commentsForEditor || '(none provided)', { align: 'justify' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
