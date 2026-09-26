using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Backend.src.Infrastructure.Utils
{
    public class EmailUtil
    {
        private readonly Regex _emailRegex = new(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$");
        private readonly IConfiguration _config;
        private readonly SmtpClient _smtpClient;

        public EmailUtil(IConfiguration config)
        {
            _config = config;

            _smtpClient = new SmtpClient
            {
                Host = _config["Smtp:Host"],
                Port = int.Parse(_config["Smtp:Port"] ?? "587"),
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    _config["Smtp:Username"],
                    _config["Smtp:Password"]
                )
            };
        }

        private bool IsValidSyntax(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            return _emailRegex.IsMatch(email);
        }

        private bool HasMxRecord(string domain)
        {
            try
            {
                // Synchronous MX check bằng cách ping DNS (DnsClient không hỗ trợ sync, 
                // nên bỏ qua hoặc giả lập là true nếu không cần strict)
                return true; // hoặc cài thư viện khác hỗ trợ sync nếu muốn thật
            }
            catch
            {
                return false;
            }
        }

        public void SendVerificationEmail(string to, string verifyLink)
        {
            var from = _config["Smtp:From"] ?? "no-reply@yourapp.com";

            var message = new MailMessage(from, to)
            {
                Subject = "Verify your email",
                Body = GetEmailTemplate().Replace("{{verify_link}}", verifyLink),
                IsBodyHtml = true
            };

            _smtpClient.Send(message); // synchronous send 
        }

        public bool IsValidEmail(string email)
        {
            if (!IsValidSyntax(email))
                return false;

            var domain = email.Substring(email.IndexOf('@') + 1);
            return HasMxRecord(domain);
        }

        private string GetEmailTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Verify your email</title>
  <style>
    body { font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f8;color:#333; }
    .container { max-width:500px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .header { background:#0a66c2;color:white;text-align:center;padding:24px; }
    .header h1 { margin:0;font-size:24px; }
    .content { padding:24px; }
    .content p { font-size:15px;line-height:1.6;margin-bottom:20px; }
    .verify-btn { display:inline-block;padding:12px 24px;background:#0a66c2;color:white!important;text-decoration:none;border-radius:6px;font-weight:bold; }
    .footer { text-align:center;font-size:13px;color:#777;padding:16px;background:#f9fafb; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Verify your email</h1>
    </div>
    <div class='content'>
      <p>Hi there! Thanks for signing up. Please confirm your email address by clicking the button below.</p>
      <p style='text-align:center;'>
        <a href='{{verify_link}}' class='verify-btn'>Verify Email</a>
      </p>
      <p>If you didn’t sign up for this account, you can safely ignore this message</p>
    </div>
    <div class='footer'>
      &copy; 2025 LinkedIn Clone · All rights reserved
    </div>
  </div>
</body>
</html>";
        }

        public string GetSuccessHtml()
        {
            return """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>Email Verified</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background-color: #121212;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .card {
            background-color: #181818;
            padding: 48px;
            border-radius: 12px;
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        h1 {
            color: #1DB954;
            margin-bottom: 16px;
            font-size: 24px;
        }

        p {
            color: #B3B3B3;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        a {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1DB954;
            color: #000000;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
        }

        a:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Email verified</h1>
        <p>
            Your email address has been successfully verified.
            You can now sign in and start using the application.
        </p>
        <a href="https://your-frontend-url.com/login">Go to login</a>
    </div>
</body>
</html>
""";
        }

        public string GetFailedHtml()
        {
            return """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>Email Verification Failed</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background-color: #121212;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .card {
            background-color: #181818;
            padding: 48px;
            border-radius: 12px;
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        h1 {
            color: #e91429;
            margin-bottom: 16px;
            font-size: 24px;
        }

        p {
            color: #B3B3B3;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        a {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1DB954;
            color: #000000;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
        }

        a:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Verification failed</h1>
        <p>
            This verification link is invalid or has expired.
            Please request a new verification email.
        </p>
        <a href="https://your-frontend-url.com/resend-verification">
            Resend verification email
        </a>
    </div>
</body>
</html>
""";
        }
    }
}
