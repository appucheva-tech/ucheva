exports.emailTemplate = (username, OTP)=>{ 
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ucheva Verification Code</title>
    <style>
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px hsla(20, 90%, 47%, 0.78);">
                        
                        <!-- Header / Logo Area -->
                        <tr>
                            <td align="center" style="padding: 30px 20px 10px 20px;">
                                <h1 style="margin: 0; color: #0011ff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">UCHEVA!</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 30px 40px; text-align: center; color: #1f2937;">
                                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700;">Welcome, ${username}!</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px; color: #4b5563;">
                                    We're excited to have you onboard on our app!. Please, use the verification code below to finish setting up your account:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                    <span class="otp-code" style="font-family: monospace; font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #111827; display: block;">
                                        ${OTP}
                                    </span>
                                </div>

                                <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                    This code will expire in 5 minutes. <br>
                                    If you didn't request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Simple Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #ffffff; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0;">&copy; 2026 UCHEVA. Run a school system? We got you covered!.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`

};


exports.inviteTemplate = (username, link)=>{ 
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ucheva Verification Code</title>
    <style>
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px hsla(20, 90%, 47%, 0.78);">
                        
                        <!-- Header / Logo Area -->
                        <tr>
                            <td align="center" style="padding: 30px 20px 10px 20px;">
                                <h1 style="margin: 0; color: #0011ff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">UCHEVA!</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 30px 40px; text-align: center; color: #1f2937;">
                                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700;">Welcome, ${username}!</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px; color: #4b5563;">
                                    We're excited to have you in our school!. Please, use the link below to finish setting up your account:
                                </p>
                                
                                <!-- Link Box -->
                                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                    <button class="otp-code" style="font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 10px; color: #111827; display: block; width:448px; height:60px;>
                                        ${link}
                                    </button>
                                </div>

                                <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                    This code will expire in 24hours. <br><br>
                                    If you didn't request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Simple Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #ffffff; border-top: 1px solid #f3f4f6; font-size: 12px; color: rgb(26, 97, 219);">
                                <p style="margin: 0;">&copy; 2026 UCHEVA. Run a school system? We got you covered!.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`

};
