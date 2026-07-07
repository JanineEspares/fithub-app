const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.generateReceiptPdf = ({ transaction, user, order }) => {
    const receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, `receipt-${transaction.id}.pdf`);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(20).text('FitHub Receipt');
        doc.moveDown();
        doc.fontSize(12).text(`Transaction ID: ${transaction.id}`);
        doc.text(`Order ID: ${transaction.order_id}`);
        if (order) {
            doc.text(`Order Number: ${order.order_number}`);
            doc.text(`Order Status: ${order.status}`);
            doc.text(`Order Total: ${order.total_amount}`);
            doc.text(`Recipient: ${order.recipient_name}`);
        }
        doc.text(`Status: ${transaction.status}`);
        doc.text(`Amount: ${transaction.amount}`);
        doc.text(`Customer: ${user ? `${user.first_name} ${user.last_name}` : 'N/A'}`);
        doc.text(`Date: ${new Date().toISOString()}`);

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};
