const nodemailer = require('nodemailer');

const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

const sanitizeInput = (input) => {
  return String(input).trim().slice(0, 1000);
};

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    const { fullName, email, message } = JSON.parse(event.body);

    if (!fullName || !email || !message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const cleanName = sanitizeInput(fullName);
    const cleanEmail = sanitizeInput(email);
    const cleanMessage = sanitizeInput(message);

    if (cleanName.length < 2) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
        },
        body: JSON.stringify({ error: 'Name is too short' })
      };
    }

    if (!validateEmail(cleanEmail)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
        },
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    if (cleanMessage.length < 10) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
        },
        body: JSON.stringify({ error: 'Message is too short' })
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"${cleanName}" <${process.env.GMAIL_USER}>`,
      replyTo: cleanEmail,
      to: 'normuminovbegzod55@gmail.com',
      subject: `New contact form submission from ${cleanName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Submission</h2>
          <div style="margin: 20px 0;">
            <p><strong style="color: #555;">Name:</strong> ${cleanName}</p>
            <p><strong style="color: #555;">Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <strong style="color: #555;">Message:</strong>
              <p style="white-space: pre-wrap; color: #666; margin-top: 10px;">${cleanMessage}</p>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This email was sent from your contact form.</p>
        </div>
      `,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
      },
      body: JSON.stringify({ success: true, message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Email send error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.DOMAIN_URL || '*'
      },
      body: JSON.stringify({ error: 'Failed to send email', details: error.message })
    };
  }
};

module.exports = { handler };
