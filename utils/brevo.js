const {BrevoClient} = require('@getbrevo/brevo');

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
})

exports.sendBrevoEmail = async(options)=>{
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: options.subject,
            htmlContent: options.html,
            sender: {
                name: 'Ucheva App',
                email: process.env.USER_EMAIL
            },
            to: [{ email: options.email }]
        })
        console.log(`email successfully sent to ${options.email}`)


    } catch (error) {
        console.log(`error while sending email to ${options.email}`, error.message)
    }
}
