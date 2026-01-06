import { base44 } from '@/api/base44Client';

const APP_NAME = 'Dang Market';
const SUPPORT_EMAIL = 'support@dangmarket.com';
const SUPPORT_PHONE = '+977-9800000000';

// Email Templates
const getOrderConfirmationEmail = (order) => {
  const itemsList = order.items?.map(item => 
    `• ${item.product_name} x ${item.quantity} ${item.unit_type} - Rs. ${item.total_price?.toLocaleString()}`
  ).join('\n') || '';

  const deliveryInfo = order.delivery_method === 'pickup' 
    ? `Pickup Location: ${order.pickup_location}`
    : `Delivery Address: ${order.address_area}, Ward ${order.address_ward}, ${order.address_municipality}`;

  return {
    subject: `Order Confirmed - ${order.order_number} | ${APP_NAME}`,
    body: `
Dear ${order.customer_name},

Thank you for your order! We're excited to confirm that your order has been received.

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.order_number}
Order Date: ${new Date(order.created_date).toLocaleDateString('en-US', { dateStyle: 'long' })}

ITEMS:
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
Subtotal: Rs. ${order.subtotal?.toLocaleString() || order.total_amount?.toLocaleString()}
Delivery Fee: Rs. ${order.delivery_fee?.toLocaleString() || 0}
TOTAL: Rs. ${order.total_amount?.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━

📍 ${order.delivery_method === 'pickup' ? 'PICKUP' : 'DELIVERY'} INFORMATION
${deliveryInfo}
${order.delivery_date ? `Scheduled Date: ${order.delivery_date}` : ''}
${order.delivery_time_slot ? `Time Slot: ${order.delivery_time_slot === 'morning' ? 'Morning (8AM-12PM)' : order.delivery_time_slot === 'afternoon' ? 'Afternoon (12PM-4PM)' : 'Evening (4PM-7PM)'}` : ''}

💳 PAYMENT
Method: ${order.payment_method?.toUpperCase().replace(/_/g, ' ')}
Status: ${order.payment_status === 'completed' ? 'Paid ✓' : 'Pending'}

${order.is_international_order ? `
🎁 GIFT ORDER
This order is being sent as a gift.
${order.gift_message ? `Gift Message: "${order.gift_message}"` : ''}
` : ''}

Track your order anytime at our website.

If you have any questions, please contact us:
📧 ${SUPPORT_EMAIL}
📞 ${SUPPORT_PHONE}

Thank you for shopping with ${APP_NAME}!

Best regards,
The ${APP_NAME} Team
    `.trim()
  };
};

const getShipmentUpdateEmail = (order, newStatus) => {
  const statusMessages = {
    confirmed: {
      title: '✅ Order Confirmed',
      message: 'Great news! Your order has been confirmed and is being processed.'
    },
    preparing: {
      title: '📦 Order Being Prepared',
      message: 'Your order is now being prepared. Our team is carefully packing your items.'
    },
    out_for_delivery: {
      title: '🚚 Out for Delivery',
      message: 'Exciting! Your order is on its way to you. Our delivery partner will reach you soon.'
    },
    completed: {
      title: '🎉 Order Delivered',
      message: 'Your order has been successfully delivered. We hope you enjoy your purchase!'
    },
    cancelled: {
      title: '❌ Order Cancelled',
      message: 'Your order has been cancelled. If you did not request this cancellation, please contact us immediately.'
    }
  };

  const statusInfo = statusMessages[newStatus] || { title: 'Order Update', message: 'Your order status has been updated.' };

  return {
    subject: `${statusInfo.title} - ${order.order_number} | ${APP_NAME}`,
    body: `
Dear ${order.customer_name},

${statusInfo.title}

${statusInfo.message}

📦 ORDER: ${order.order_number}
📍 STATUS: ${newStatus.replace(/_/g, ' ').toUpperCase()}

${newStatus === 'out_for_delivery' ? `
🗺️ TRACK YOUR ORDER
You can track your delivery in real-time on our website. Log in to your account and visit the Order Tracking page.

Estimated delivery: Today
` : ''}

${newStatus === 'completed' ? `
⭐ WE'D LOVE YOUR FEEDBACK
Your opinion matters to us! Please take a moment to rate your experience.
` : ''}

Order Total: Rs. ${order.total_amount?.toLocaleString()}

If you have any questions, please contact us:
📧 ${SUPPORT_EMAIL}
📞 ${SUPPORT_PHONE}

Thank you for choosing ${APP_NAME}!

Best regards,
The ${APP_NAME} Team
    `.trim()
  };
};

const getLowStockAlertEmail = (products, adminEmail) => {
  const productList = products.map(p => 
    `• ${p.name} (${p.category_name || 'Uncategorized'}) - ${p.stock_quantity} ${p.unit_type} remaining${p.stock_quantity === 0 ? ' ⚠️ OUT OF STOCK' : ''}`
  ).join('\n');

  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const lowStockCount = products.filter(p => p.stock_quantity > 0).length;

  return {
    subject: `⚠️ Low Stock Alert - ${products.length} Products Need Attention | ${APP_NAME}`,
    body: `
Hello Admin,

This is an automated low stock alert from ${APP_NAME}.

📊 INVENTORY ALERT SUMMARY
━━━━━━━━━━━━━━━━━━━━━
🔴 Out of Stock: ${outOfStockCount} products
🟡 Low Stock (≤10 units): ${lowStockCount} products
━━━━━━━━━━━━━━━━━━━━━

PRODUCTS REQUIRING ATTENTION:
${productList}

📋 RECOMMENDED ACTIONS:
1. Review and reorder out-of-stock items immediately
2. Contact suppliers for low-stock products
3. Update inventory after restocking

Visit the Admin Dashboard for detailed analytics and to update stock levels.

This is an automated message from ${APP_NAME} inventory management system.
    `.trim()
  };
};

const getPasswordResetEmail = (userEmail, resetLink) => {
  return {
    subject: `Password Reset Request | ${APP_NAME}`,
    body: `
Hello,

We received a request to reset the password for your ${APP_NAME} account associated with this email address.

🔐 RESET YOUR PASSWORD
Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

⚠️ DIDN'T REQUEST THIS?
If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

For security, never share this link with anyone.

If you have any questions, please contact us:
📧 ${SUPPORT_EMAIL}
📞 ${SUPPORT_PHONE}

Best regards,
The ${APP_NAME} Team
    `.trim()
  };
};

// Email Sending Functions
export const sendOrderConfirmationEmail = async (order) => {
  if (!order.customer_email) return { success: false, error: 'No customer email' };
  
  const { subject, body } = getOrderConfirmationEmail(order);
  
  try {
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject,
      body,
      from_name: APP_NAME
    });
    
    // If it's a gift order, also email the sender
    if (order.is_international_order && order.sender_email && order.sender_email !== order.customer_email) {
      await base44.integrations.Core.SendEmail({
        to: order.sender_email,
        subject: `Gift Order Confirmed - ${order.order_number} | ${APP_NAME}`,
        body: `
Dear ${order.sender_name || 'Customer'},

Your gift order has been confirmed and will be delivered to ${order.customer_name}.

Order Number: ${order.order_number}
Total: Rs. ${order.total_amount?.toLocaleString()}
${order.gift_message ? `\nYour gift message: "${order.gift_message}"` : ''}

We'll notify you when the order is delivered.

Thank you for choosing ${APP_NAME}!
        `.trim(),
        from_name: APP_NAME
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

export const sendShipmentUpdateEmail = async (order, newStatus) => {
  if (!order.customer_email) return { success: false, error: 'No customer email' };
  
  const { subject, body } = getShipmentUpdateEmail(order, newStatus);
  
  try {
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject,
      body,
      from_name: APP_NAME
    });
    
    // Notify sender for gift orders on delivery
    if (order.is_international_order && order.sender_email && newStatus === 'completed') {
      await base44.integrations.Core.SendEmail({
        to: order.sender_email,
        subject: `🎉 Gift Delivered - ${order.order_number} | ${APP_NAME}`,
        body: `
Dear ${order.sender_name || 'Customer'},

Great news! Your gift has been successfully delivered to ${order.customer_name}.

Order Number: ${order.order_number}

Thank you for spreading joy with ${APP_NAME}!
        `.trim(),
        from_name: APP_NAME
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send shipment update email:', error);
    return { success: false, error: error.message };
  }
};

export const sendLowStockAlertEmail = async (products, adminEmail) => {
  if (!adminEmail || products.length === 0) return { success: false, error: 'No admin email or products' };
  
  const { subject, body } = getLowStockAlertEmail(products, adminEmail);
  
  try {
    await base44.integrations.Core.SendEmail({
      to: adminEmail,
      subject,
      body,
      from_name: `${APP_NAME} Inventory`
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send low stock alert email:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (userEmail, resetLink) => {
  if (!userEmail) return { success: false, error: 'No email provided' };
  
  const { subject, body } = getPasswordResetEmail(userEmail, resetLink);
  
  try {
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject,
      body,
      from_name: APP_NAME
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Utility to check and send low stock alerts
export const checkAndSendLowStockAlerts = async (products, adminEmail, threshold = 10) => {
  const lowStockProducts = products.filter(p => p.stock_quantity <= threshold && p.is_visible);
  
  if (lowStockProducts.length > 0) {
    return await sendLowStockAlertEmail(lowStockProducts, adminEmail);
  }
  
  return { success: true, message: 'No low stock products' };
};