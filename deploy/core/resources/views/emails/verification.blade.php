<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 40px; }
        .otp { font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 40px 0; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 60px; text-transform: uppercase; letter-spacing: 2px; }
    </style>
</head>
<body>
    <div className="container">
        <div className="logo">MOHANED</div>
        <h1>Identity Verification</h1>
        <p>Use the following code to complete your security protocol:</p>
        <div className="otp">{{ $otp }}</div>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this message.</p>
        <div className="footer">Mohaned store Security • Managed by scicode academy</div>
    </div>
</body>
</html>
