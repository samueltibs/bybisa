import Resend from 'resend'

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY || 're_AYbogxJR_NX7cCQ9NHr7hVx42Su3B186r')

// Sender config
const BILLING_SENDER = 'ByBisa Billing <billing@bisagroup.org>'
const GENERAL_SENDER = 'ByBisa <bybisa@bisagroup.org>'
const REPLY_TO = 'bybisa@bisagroup.org'

// âââ Shared styles âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const BASE_STYLES = {
  wrapper: 'background-color:#F9F9F9;margin:0;padding:0;font-family:Inter,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;',
  container: 'max-width:620px;margin:0 auto;background-color:#ffffff;',
  header: 'background-color:#121212;padding:28px 32px;',
  logoText: 'font-family:Inter,sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:2px;margin:0;',
  logoSub: 'font-size:11px;color:#C75B2B;letter-spacing:4px;text-transform:uppercase;margin:0;',
  body: 'padding:36px 32px;',
  heading: 'font-size:24px;font-weight:700;color:#121212;margin:0 0 12px;line-height:1.3;',
  subtext: 'font-size:15px;color:#555555;line-height:1.6;margin:0 0 24px;',
  receiptBox: 'background-color:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:24px;margin:24px 0;',
  receiptLabel: 'font-size:12px;color:#999999;text-transform:uppercase;letter-spacing:1px;margin:0 0 3px;',
  receiptValue: 'font-size:14px;color:#121212;font-weight:600;margin:0 0 16px;',
  downloadBtn: 'display:inline-block;background-color:#C75B2B;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 32px;border-radius:50px;margin:24px 0;',
  shopBtn: 'display:inline-block;background-color:#121212;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:50px;margin:16px 0;',
  divider: 'border:none;border-top:1px solid #E8E8E8;margin:28px 0;',
  footer: 'background-color:#121212;padding:24px 32px;text-align:center;',
  footerText: 'font-size:12px;color:#888888;margin:0 0 6px;line-height:1.6;',
  footerLink: 'color:#C75B2B;text-decoration:none;',
  tipBox: 'border-left:3px solid #C75B2B;padding:12px 16px;margin:12px 0;background-color:#FDF5F2;border-radius:0 6px 6px 0;',
  tipText: 'font-size:14px;color:#121212;margin:0;',
  starLink: 'display:inline-block;font-size:28px;text-decoration:none;margin:0 4px;',
  badge: 'display:inline-block;background-color:#C75B2B;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:12px;',
}

// âââ Logo HTML âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function logoHtml() {
  return `
  <table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:middle;">
        <p style="${BASE_STYLES.logoText}">ByBisa</p>
        <p style="${BASE_STYLES.logoSub}">&#128086; Business Templates</p>
      </td>
    </tr>
  </table>`
}

// âââ Footer HTML âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function footerHtml(extraNote?: string) {
  return `
  <div style="${BASE_STYLES.footer}">
    ${extraNote ? `<p style="${BASE_STYLES.footerText}">${extraNote}</p><br/>` : ''}
    <p style="${BASE_STYLES.footerText}">Questions? Reply to this email or reach us at <a href="mailto:bybisa@bisagroup.org" style="${BASE_STYLES.footerLink}">bybisa@bisagroup.org</a></p>
    <p style="${BASE_STYLES.footerText}">Bisa Group LLC &bull; Delaware, USA</p>
    <p style="${BASE_STYLES.footerText}"><a href="https://bybisa.vercel.app" style="${BASE_STYLES.footerLink}">bybisa.com</a></p>
    <p style="font-size:11px;color:#555555;margin:12px 0 0;">You received this email because you made a purchase on ByBisa. &copy; 2026 Bisa Group LLC. All rights reserved.</p>
  </div>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EMAIL 1: PURCHASE RECEIPT
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export interface ReceiptParams {
  customer_email: string
  customer_name: string
  order_number: string
  product_title: string
  amount: string
  currency: string
  payment_method: string
  payment_reference: string
  download_url: string
  remaining_downloads: number
  purchase_date: string
}

export function buildReceiptHtml(p: ReceiptParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your ByBisa Receipt \u2014 ${p.order_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #F9F9F9; }
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .body-pad { padding: 24px 20px !important; }
      .receipt-row td { display: block !important; width: 100% !important; }
      .download-btn { padding: 14px 24px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body style="${BASE_STYLES.wrapper}">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.wrapper}">
    <tr><td align="center" style="padding:24px 16px;">
      <table class="container" width="620" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.container}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="${BASE_STYLES.header}">${logoHtml()}</td>
        </tr>

        <!-- ORANGE STRIPE -->
        <tr><td style="background-color:#C75B2B;height:4px;"></td></tr>

        <!-- BODY -->
        <tr>
          <td class="body-pad" style="${BASE_STYLES.body}">

            <!-- Greeting -->
            <p style="${BASE_STYLES.heading}">Hey ${p.customer_name}! \uD83C\uDF89</p>
            <p style="${BASE_STYLES.subtext}">Your purchase is confirmed and your download is ready. Here\u2019s your official receipt:</p>

            <!-- Receipt Box -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.receiptBox}border-left:4px solid #C75B2B;">
              <tr>
                <td width="50%" style="vertical-align:top;padding-right:16px;">
                  <p style="${BASE_STYLES.receiptLabel}">Receipt #</p>
                  <p style="${BASE_STYLES.receiptValue}">${p.order_number}</p>
                  <p style="${BASE_STYLES.receiptLabel}">Date</p>
                  <p style="${BASE_STYLES.receiptValue}">${p.purchase_date}</p>
                  <p style="${BASE_STYLES.receiptLabel}">Product</p>
                  <p style="${BASE_STYLES.receiptValue}">${p.product_title}</p>
                </td>
                <td width="50%" style="vertical-align:top;">
                  <p style="${BASE_STYLES.receiptLabel}">Amount Paid</p>
                  <p style="font-size:22px;font-weight:800;color:#C75B2B;margin:0 0 16px;">${p.currency} ${p.amount}</p>
                  <p style="${BASE_STYLES.receiptLabel}">Payment Method</p>
                  <p style="${BASE_STYLES.receiptValue}">${p.payment_method}</p>
                  <p style="${BASE_STYLES.receiptLabel}">Payment Reference</p>
                  <p style="font-size:12px;color:#121212;font-weight:600;margin:0;word-break:break-all;">${p.payment_reference || '\u2014'}</p>
                </td>
              </tr>
            </table>

            <!-- Download Button -->
            <p style="font-size:15px;color:#121212;font-weight:600;margin:24px 0 8px;">Your download is ready:</p>
            <div style="text-align:center;margin:8px 0;">
              <a class="download-btn" href="${p.download_url}" style="${BASE_STYLES.downloadBtn}">\uD83D\uDCE5 Download Your Product</a>
            </div>

            <!-- Downloads remaining -->
            <div style="background-color:#FDF5F2;border:1px solid #F0CCC0;border-radius:8px;padding:12px 16px;margin:16px 0;text-align:center;">
              <p style="font-size:13px;color:#C75B2B;margin:0;"><strong>\uD83D\uDCCA ${p.remaining_downloads} download${p.remaining_downloads !== 1 ? 's' : ''} remaining</strong> for this purchase. Save your file immediately after downloading!</p>
            </div>

            <hr style="${BASE_STYLES.divider}"/>

            <!-- What's next? -->
            <p style="font-size:16px;font-weight:700;color:#121212;margin:0 0 12px;">What happens next?</p>
            <div style="${BASE_STYLES.tipBox}">
              <p style="${BASE_STYLES.tipText}">\u2705 <strong>Download</strong> your file and save it somewhere safe</p>
            </div>
            <div style="${BASE_STYLES.tipBox}">
              <p style="${BASE_STYLES.tipText}">\uD83D\uDCDA <strong>Review</strong> the instructions included in the file</p>
            </div>
            <div style="${BASE_STYLES.tipBox}">
              <p style="${BASE_STYLES.tipText}">\uD83D\uDE80 <strong>Apply it</strong> to your business and watch things take off</p>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr><td>${footerHtml()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EMAIL 2: WELCOME
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export interface WelcomeParams {
  customer_email: string
  customer_name: string
  product_title: string
  product_type: string
}

export function buildWelcomeHtml(p: WelcomeParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to ByBisa, ${p.customer_name}!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #F9F9F9; }
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .body-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="${BASE_STYLES.wrapper}">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.wrapper}">
    <tr><td align="center" style="padding:24px 16px;">
      <table class="container" width="620" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.container}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="${BASE_STYLES.header}">${logoHtml()}</td></tr>
        <tr><td style="background-color:#C75B2B;height:4px;"></td></tr>

        <!-- HERO SECTION -->
        <tr>
          <td style="background-color:#121212;padding:40px 32px;text-align:center;">
            <p style="font-size:48px;margin:0 0 12px;">\uD83D\uDCAA</p>
            <p style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 8px;line-height:1.3;">Welcome to the ByBisa family, ${p.customer_name}!</p>
            <p style="font-size:15px;color:#CCCCCC;margin:0;line-height:1.6;">You just took a big step toward building something amazing. We\u2019re here to help you every step of the way.</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="body-pad" style="${BASE_STYLES.body}">

            <!-- What you got -->
            <p style="font-size:16px;font-weight:700;color:#121212;margin:0 0 12px;">Here\u2019s what you got:</p>
            <div style="background-color:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:20px;margin:0 0 28px;">
              <span style="${BASE_STYLES.badge}">${p.product_type}</span>
              <p style="font-size:18px;font-weight:700;color:#121212;margin:4px 0 0;">${p.product_title}</p>
            </div>

            <!-- What's next -->
            <p style="font-size:16px;font-weight:700;color:#121212;margin:0 0 16px;">What\u2019s next? \uD83D\uDC47</p>

            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td width="40" style="vertical-align:top;padding-top:2px;">
                  <div style="width:32px;height:32px;background-color:#C75B2B;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:800;color:#ffffff;">1</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;padding-bottom:20px;">
                  <p style="font-size:15px;font-weight:600;color:#121212;margin:4px 0 4px;">Download and review your ${p.product_type} right away</p>
                  <p style="font-size:13px;color:#777777;margin:0;">Check your inbox for the download link in your receipt email.</p>
                </td>
              </tr>
              <tr>
                <td width="40" style="vertical-align:top;padding-top:2px;">
                  <div style="width:32px;height:32px;background-color:#C75B2B;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:800;color:#ffffff;">2</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;padding-bottom:20px;">
                  <p style="font-size:15px;font-weight:600;color:#121212;margin:4px 0 4px;">Join our community of entrepreneurs</p>
                  <p style="font-size:13px;color:#777777;margin:0;"><a href="https://bybisa.vercel.app/community" style="color:#C75B2B;">Connect with other business builders \u2192</a></p>
                </td>
              </tr>
              <tr>
                <td width="40" style="vertical-align:top;padding-top:2px;">
                  <div style="width:32px;height:32px;background-color:#C75B2B;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:800;color:#ffffff;">3</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;padding-bottom:8px;">
                  <p style="font-size:15px;font-weight:600;color:#121212;margin:4px 0 4px;">Check out more tools to grow your business</p>
                  <p style="font-size:13px;color:#777777;margin:0 0 8px;">We\u2019re always adding new templates, guides, and formulas designed for fashion entrepreneurs.</p>
                  <a href="https://bybisa.vercel.app/shop" style="${BASE_STYLES.shopBtn}font-size:13px;padding:10px 20px;">Browse the Shop \u2192</a>
                </td>
              </tr>
            </table>

            <hr style="${BASE_STYLES.divider}"/>

            <p style="font-size:20px;text-align:center;margin:0 0 8px;">\uD83E\uDD42 Cheers to your success!</p>
            <p style="font-size:15px;color:#555555;text-align:center;margin:0;">\u2014 Esther &amp; the ByBisa Team</p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr><td>${footerHtml()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EMAIL 3: DOWNLOAD REMINDER
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export interface DownloadReminderParams {
  customer_email: string
  customer_name: string
  product_title: string
  download_url: string
}

export function buildDownloadReminderHtml(p: DownloadReminderParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your ${p.product_title} is waiting for you!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #F9F9F9; }
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .body-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="${BASE_STYLES.wrapper}">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.wrapper}">
    <tr><td align="center" style="padding:24px 16px;">
      <table class="container" width="620" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.container}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="${BASE_STYLES.header}">${logoHtml()}</td></tr>
        <tr><td style="background-color:#C75B2B;height:4px;"></td></tr>

        <!-- BODY -->
        <tr>
          <td class="body-pad" style="${BASE_STYLES.body}text-align:center;">
            <p style="font-size:52px;margin:0 0 16px;">\uD83D\uDCE6</p>
            <p style="${BASE_STYLES.heading}text-align:center;">Your purchase is waiting, ${p.customer_name}!</p>
            <p style="font-size:15px;color:#555555;margin:0 0 8px;">You haven\u2019t downloaded your purchase yet.</p>
            <p style="font-size:18px;font-weight:700;color:#121212;margin:0 0 28px;"><em>\u201C${p.product_title}\u201D</em></p>

            <a href="${p.download_url}" style="${BASE_STYLES.downloadBtn}">\uD83D\uDCE5 Download Now</a>

            <p style="font-size:13px;color:#888888;margin:20px 0 0;">Your download link is valid for a limited time. Don\u2019t miss out!</p>
          </td>
        </tr>

        <!-- TROUBLE? -->
        <tr>
          <td style="padding:0 32px 32px;">
            <div style="background-color:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:16px 20px;text-align:center;">
              <p style="font-size:14px;color:#555555;margin:0;">Having trouble downloading? <strong>Reply to this email</strong> and we\u2019ll help you out right away. \uD83E\uDD1D</p>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr><td>${footerHtml()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EMAIL 4: REVIEW REQUEST
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export interface ReviewRequestParams {
  customer_email: string
  customer_name: string
  product_title: string
  product_id: string
}

export function buildReviewRequestHtml(p: ReviewRequestParams): string {
  const baseReviewUrl = `https://bybisa.vercel.app/review?product_id=${encodeURIComponent(p.product_id)}&email=${encodeURIComponent(p.customer_email)}&rating=`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>How\u2019s it going with ${p.product_title}?</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #F9F9F9; }
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .body-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="${BASE_STYLES.wrapper}">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.wrapper}">
    <tr><td align="center" style="padding:24px 16px;">
      <table class="container" width="620" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.container}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="${BASE_STYLES.header}">${logoHtml()}</td></tr>
        <tr><td style="background-color:#C75B2B;height:4px;"></td></tr>

        <!-- BODY -->
        <tr>
          <td class="body-pad" style="${BASE_STYLES.body}">
            <p style="${BASE_STYLES.heading}">How\u2019s it going with <em>${p.product_title}</em>? \u2B50</p>
            <p style="${BASE_STYLES.subtext}">Hey ${p.customer_name}! It\u2019s been a week since you downloaded your product. We\u2019d love to hear how things are going and if it\u2019s been helpful for your business.</p>

            <!-- Star Rating -->
            <div style="background-color:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:28px;text-align:center;margin:24px 0;">
              <p style="font-size:15px;font-weight:600;color:#121212;margin:0 0 16px;">Click a star to leave your rating:</p>
              <a href="${baseReviewUrl}1" style="${BASE_STYLES.starLink}" title="1 star">\u2B50</a>
              <a href="${baseReviewUrl}2" style="${BASE_STYLES.starLink}" title="2 stars">\u2B50</a>
              <a href="${baseReviewUrl}3" style="${BASE_STYLES.starLink}" title="3 stars">\u2B50</a>
              <a href="${baseReviewUrl}4" style="${BASE_STYLES.starLink}" title="4 stars">\u2B50</a>
              <a href="${baseReviewUrl}5" style="${BASE_STYLES.starLink}" title="5 stars">\u2B50</a>
              <p style="font-size:12px;color:#999999;margin:12px 0 0;">1 = Needs work &nbsp;&bull;&nbsp; 5 = Absolutely loved it!</p>
            </div>

            <p style="font-size:14px;color:#777777;line-height:1.6;margin:0;">Your review helps other entrepreneurs find the right tools for their business. Even a few words make a huge difference. \u2764\uFE0F</p>

            <hr style="${BASE_STYLES.divider}"/>
            <p style="font-size:14px;color:#555555;margin:0;">Need anything? Just reply to this email \u2014 we read every message.</p>
            <p style="font-size:14px;color:#555555;margin:8px 0 0;">\u2014 Esther &amp; the ByBisa Team</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr><td>${footerHtml()}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EMAIL 5: NEW PRODUCT ANNOUNCEMENT
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export interface ProductAnnouncementParams {
  customer_emails: string[]
  product_title: string
  product_description: string
  product_image: string
  price: string
  currency: string
  shop_url: string
  target_audience: string
}

export function buildProductAnnouncementHtml(p: Omit<ProductAnnouncementParams, 'customer_emails'>): string {
  const imageHtml = p.product_image
    ? `<img src="${p.product_image}" alt="${p.product_title}" style="width:100%;max-width:556px;height:auto;border-radius:8px;display:block;margin:0 auto 24px;"/>`
    : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#121212 0%,#2a2a2a 100%);border-radius:8px;margin:0 0 24px;display:flex;align-items:center;justify-content:center;">
        <p style="font-size:48px;text-align:center;margin:0;padding-top:60px;">\uD83D\uDCCB</p>
       </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Something new just dropped! \uD83D\uDD25</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #F9F9F9; }
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .body-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="${BASE_STYLES.wrapper}">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.wrapper}">
    <tr><td align="center" style="padding:24px 16px;">
      <table class="container" width="620" border="0" cellpadding="0" cellspacing="0" style="${BASE_STYLES.container}border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="${BASE_STYLES.header}">${logoHtml()}</td></tr>

        <!-- ANNOUNCEMENT BANNER -->
        <tr>
          <td style="background-color:#C75B2B;padding:16px 32px;text-align:center;">
            <p style="font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ffffff;margin:0;">\uD83D\uDD25 New Drop</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="body-pad" style="${BASE_STYLES.body}">
            <p style="${BASE_STYLES.heading}text-align:center;">Something new just dropped!</p>
            <p style="font-size:14px;color:#777777;text-align:center;margin:0 0 24px;">This one\u2019s perfect for <strong>${p.target_audience}</strong></p>

            <!-- Product Image -->
            ${imageHtml}

            <!-- Product Info -->
            <p style="font-size:22px;font-weight:800;color:#121212;margin:0 0 8px;">${p.product_title}</p>
            <p style="font-size:15px;color:#555555;line-height:1.6;margin:0 0 20px;">${p.product_description}</p>

            <!-- Price & CTA -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="font-size:28px;font-weight:800;color:#C75B2B;margin:0;">${p.currency} ${p.price}</p>
                </td>
                <td style="vertical-align:middle;text-align:right;">
                  <a href="${p.shop_url}" style="${BASE_STYLES.downloadBtn}margin:0;">Shop Now \u2192</a>
                </td>
              </tr>
            </table>

            <hr style="${BASE_STYLES.divider}"/>

            <!-- Social proof nudge -->
            <div style="text-align:center;">
              <p style="font-size:14px;color:#777777;margin:0;">\uD83D\uDCAC Join hundreds of fashion entrepreneurs using ByBisa tools to build their dream businesses.</p>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr><td>${footerHtml('You\u2019re receiving this because you\u2019re a valued ByBisa customer. <a href="https://bybisa.vercel.app/unsubscribe" style="color:#C75B2B;">Unsubscribe</a>')}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SEND FUNCTIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function sendReceipt(p: ReceiptParams) {
  const { data, error } = await resend.emails.send({
    from: BILLING_SENDER,
    to: p.customer_email,
    reply_to: REPLY_TO,
    subject: `Your ByBisa receipt â ${p.order_number}`,
    html: buildReceiptHtml(p),
  })
  if (error) throw new Error(error.message)
  return data!
}

export async function sendWelcome(p: WelcomeParams) {
  const { data, error } = await resend.emails.send({
    from: GENERAL_SENDER,
    to: p.customer_email,
    reply_to: REPLY_TO,
    subject: `Welcome to ByBisa, ${p.customer_name}! \uD83D\uDCAA`,
    html: buildWelcomeHtml(p),
  })
  if (error) throw new Error(error.message)
  return data!
}

export async function sendDownloadReminder(p: DownloadReminderParams) {
  const { data, error } = await resend.emails.send({
    from: GENERAL_SENDER,
    to: p.customer_email,
    reply_to: REPLY_TO,
    subject: `Your ${p.product_title} is waiting for you \uD83D\uDCE6`,
    html: buildDownloadReminderHtml(p),
  })
  if (error) throw new Error(error.message)
  return data!
}

export async function sendReviewRequest(p: ReviewRequestParams) {
  const { data, error } = await resend.emails.send({
    from: GENERAL_SENDER,
    to: p.customer_email,
    reply_to: REPLY_TO,
    subject: `How\u2019s it going with ${p.product_title}? \u2B50`,
    html: buildReviewRequestHtml(p),
  })
  if (error) throw new Error(error.message)
  return data!
}

export async function sendProductAnnouncement(p: ProductAnnouncementParams) {
  const { customer_emails, ...rest } = p
  const html = buildProductAnnouncementHtml(rest)
  const results = await Promise.all(
    customer_emails.map(async (email) => {
      const { data, error } = await resend.emails.send({
        from: GENERAL_SENDER,
        to: email,
        reply_to: REPLY_TO,
        subject: `\uD83D\uDD25 New drop: ${p.product_title} â ByBisa`,
        html,
      })
      if (error) {
        console.error(`Failed to send announcement to ${email}: ${error.message}`)
        return null
      }
      return data
    })
  )
  return results.filter(Boolean)
}
