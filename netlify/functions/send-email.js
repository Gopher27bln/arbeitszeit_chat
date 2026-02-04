const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { question, userEmail, userName } = JSON.parse(event.body);

        if (!question) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Frage fehlt' })
            };
        }

        const emailTransporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_CONTACT || 'ansprechperson@schule.de',
            subject: 'Frage zur Arbeitszeiterfassung - Chatbot-Weiterleitung',
            html: `
                <h2>Neue Frage zur Arbeitszeiterfassung</h2>
                <p><strong>Von:</strong> ${userName || 'Unbekannt'} (${userEmail || 'Keine E-Mail angegeben'})</p>
                <p><strong>Frage:</strong></p>
                <blockquote style="background: #f9f9f9; border-left: 4px solid #ccc; padding: 10px;">
                    ${question}
                </blockquote>
                <p><em>Diese Anfrage wurde automatisch vom Arbeitszeiterfassungs-Chatbot weitergeleitet, da keine passende Antwort gefunden wurde.</em></p>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ success: true, message: 'E-Mail wurde erfolgreich gesendet' })
        };

    } catch (error) {
        console.error('E-Mail-Fehler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fehler beim Senden der E-Mail' })
        };
    }
};
