
  const orderSecondPaymentEmailHTML = (
    name,
    orderId,
    orderDate,
    items,
    totalAmount,
    firstPayment,
    balanceAmount,
    paymentUrl
  ) => {
    const formattedItems = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      </tr>
    `
      )
      .join('');
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Order Ready - Final Payment</title>
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
      .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 26px; }
      .content { padding: 30px 20px; }
      .content p { margin-bottom: 10px; font-size: 16px; color: #333; }
      .order-summary { margin-top: 20px; }
      .footer { background-color: #333; color: white; text-align: center; padding: 15px; font-size: 12px; }
      .footer p { margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; }
      td { padding: 10px; border: 1px solid #ddd; }
      .highlight { font-weight: bold; color: #d35400; }
      .btn { display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #f8b400; color: white; text-decoration: none; font-weight: bold; border-radius: 5px; }
      @media only screen and (max-width: 600px) { .header h1 { font-size: 22px; } .content { padding: 20px 15px; } }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Your Order is Ready!</h1></div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your order <strong>#${orderId}</strong> placed on <strong>${orderDate}</strong> is now <strong>ready for delivery</strong>.</p>
          <div class="order-summary">
            <h3>Order Summary</h3>
            <table>
              <thead>
                <tr><th>Item</th><th>Quantity</th></tr>
              </thead>
              <tbody>${formattedItems}</tbody>
            </table>
          </div>
          <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)} ETB</p>
          <p><span class="highlight">First Payment Made: ${firstPayment.toFixed(2)} ETB</span></p>
          <p><span class="highlight">Remaining Balance: ${balanceAmount.toFixed(2)} ETB</span></p>
          <p>Please complete your payment below to receive your order:</p>
          <p style="text-align: center;">
            <a class="btn" href="${paymentUrl}" target="_blank">Complete Final Payment</a>
          </p>
          <p>If you need help, reach out to our team anytime.</p>
          <p>Best regards,<br/>The Catering App Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Catering App. All rights reserved.</p>
          <p>Contact us at support@aggapecatering.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };
  
export default orderSecondPaymentEmailHTML;