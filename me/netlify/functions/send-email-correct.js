const nodemailer = require('nodemailer');

const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
};

const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

exports.handler = async (event) => {
  if (!process.env.DOMAIN_URL) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.DOMAIN_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { fullName, email, message, honeypot } = JSON.parse(event.body);

    if (honeypot && honeypot.length > 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true }),
      };
    }

    const cleanName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanMessage = String(message || '').trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: JSON.stringify({ error: 'Invalid input' }),
      };
    }

    if (!validateEmail(cleanEmail)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: JSON.stringify({ error: 'Invalid input' }),
      };
    }

    if (cleanMessage.length < 10 || cleanMessage.length > 5000) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: JSON.stringify({ error: 'Invalid input' }),
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const escapedName = escapeHtml(cleanName);
    const escapedEmail = escapeHtml(cleanEmail);
    const escapedMessage = escapeHtml(cleanMessage);

    const mailOptions = {
      from: `"Begzod Portfolio" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: cleanEmail,
      subject: `New Portfolio Contact: ${escapedName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 12px;">
          <h2 style="color: #05060f; margin-bottom: 20px;">New Contact Form Submission</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 12px 0;"><strong>Name:</strong> ${escapedName}</p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 12px 0 0 0; white-space: pre-wrap; color: #333;">${escapedMessage}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 12px;">
            Sent from Begzod Portfolio — ${new Date().toLocaleString('en-US')}
          </p>
        </div>
      `,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Email send error:', error.message);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
    };
  }
};