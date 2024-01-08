const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const { Otp } = require("../../Model/otpModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const smtppool = require("nodemailer");
const {
  CompanyVerify,
} = require("../../Model/Recruiter/Verify/company_verify.js");
const {
  ProfileVerify,
} = require("../../Model/Recruiter/Verify/profile_verify.js");

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


app.post("/email_test", async (req, res) => {
  const msg = {
    to: 'sasaharukh@gmail.com', // Change to your recipient
    from: 'hello@unbolt.co', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      return res.status(200).send("send successfull");
    })
    .catch((error) => {
      console.error(error)
      return res.status(400).json({ error: error });
    })
});


const transportar = nodemailer.createTransport({
  host: "premium89-1.web-hosting.com",
  port: 465,
  auth: {
    user: "notifications@unbolt.co",
    pass: "Notifications@Unbolt",
  },
});

function getRandomInt(max) {
  return Math.floor(Math.random() * 9000 + 1000);
}



const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post(
  "/profile_verify_test",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      const number = req.userNumber;

      if (req.body.type == 1) {
        var OTP = getRandomInt(4);
        console.log(OTP);
        const otp = await Otp({ number: number, otp: OTP });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        await otp.save();
        const mailoption = {
          from: "notifications@bringin.io",
          to: req.body.email,
          subject: "Your Bringin Account Verification Code",
          text: `Otp is ${OTP}`,
          html: `
              
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 15]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Email OTP verification from Bringin</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=DM+Sans:400,400i,700,700i,900,900i"><style>          img{-ms-interpolation-mode:bicubic;} 
          table, td{mso-table-lspace:0pt; mso-table-rspace:0pt;} 
          .mceStandardButton, .mceStandardButton td, .mceStandardButton td a{mso-hide:all !important;} 
          p, a, li, td, blockquote{mso-line-height-rule:exactly;} 
          p, a, li, td, body, table, blockquote{-ms-text-size-adjust:100%; -webkit-text-size-adjust:100%;} 
          @media only screen and (max-width: 480px){
            body, table, td, p, a, li, blockquote{-webkit-text-size-adjust:none !important;} 
          }
          .mcnPreviewText{display: none !important;} 
          .bodyCell{margin:0 auto; padding:0; width:100%;}
          .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font{line-height:100%;} 
          .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} 
          a[x-apple-data-detectors]{color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important;} 
            body{height:100%; margin:0; padding:0; width:100%; background: #ffffff;}
            p{margin:0; padding:0;} 
            table{border-collapse:collapse;} 
            td, p, a{word-break:break-word;} 
            h1, h2, h3, h4, h5, h6{display:block; margin:0; padding:0;} 
            img, a img{border:0; height:auto; outline:none; text-decoration:none;} 
            a[href^="tel"], a[href^="sms"]{color:inherit; cursor:default; text-decoration:none;} 
            li p {margin: 0 !important;}
            .ProseMirror a {
                pointer-events: none;
            }
            @media only screen and (max-width: 480px){
                body{width:100% !important; min-width:100% !important; } 
                body.mobile-native {
                    -webkit-user-select: none; user-select: none; transition: transform 0.2s ease-in; transform-origin: top center;
                }
                body.mobile-native.selection-allowed a, body.mobile-native.selection-allowed .ProseMirror {
                    user-select: auto;
                    -webkit-user-select: auto;
                }
                colgroup{display: none;}
                img{height: auto !important;}
                .mceWidthContainer{max-width: 660px !important;}
                .mceColumn{display: block !important; width: 100% !important;}
                .mceColumn-forceSpan{display: table-cell !important; width: auto !important;}
                .mceBlockContainer{padding-right:16px !important; padding-left:16px !important;} 
                .mceSpacing-24{padding-right:16px !important; padding-left:16px !important;}
                .mceFooterSection .mceText, .mceFooterSection .mceText p{font-size: 16px !important; line-height: 140% !important;}
                .mceText, .mceText p{font-size: 16px !important; line-height: 140% !important;}
                h1{font-size: 30px !important; line-height: 120% !important;}
                h2{font-size: 26px !important; line-height: 120% !important;}
                h3{font-size: 20px !important; line-height: 125% !important;}
                h4{font-size: 18px !important; line-height: 125% !important;}
                .ProseMirror {
                    -webkit-user-modify: read-write-plaintext-only;
                    user-modify: read-write-plaintext-only;
                }
            }
            @media only screen and (max-width: 640px){
                .mceClusterLayout td{padding: 4px !important;} 
            }
            div[contenteditable="true"] {outline: 0;}
            .ProseMirror .empty-node, .ProseMirror:empty {position: relative;}
            .ProseMirror .empty-node::before, .ProseMirror:empty::before {
                position: absolute;
                left: 0;
                right: 0;
                color: rgba(0,0,0,0.2);
                cursor: text;
            }
            .ProseMirror .empty-node:hover::before, .ProseMirror:empty:hover::before {
                color: rgba(0,0,0,0.3);
            }
            .ProseMirror h1.empty-node::before {
                content: 'Heading';
            }
            .ProseMirror p.empty-node:only-child::before, .ProseMirror:empty::before {
                content: 'Start typing...';
            }
            a .ProseMirror p.empty-node::before, a .ProseMirror:empty::before {
                content: '';
            }
            .mceText, .ProseMirror {
                white-space: pre-wrap;
            }
body, #bodyTable { background-color: rgb(247, 247, 247); }.mceText, .mceLabel { font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif; }.mceText, .mceLabel { color: rgb(0, 0, 0); }.mceText h1 { margin-bottom: 0px; }.mceText p { margin-bottom: 0px; }.mceText label { margin-bottom: 0px; }.mceText input { margin-bottom: 0px; }.mceSpacing-12 .mceInput + .mceErrorMessage { margin-top: -6px; }.mceText h1 { margin-bottom: 0px; }.mceText p { margin-bottom: 0px; }.mceText label { margin-bottom: 0px; }.mceText input { margin-bottom: 0px; }.mceSpacing-24 .mceInput + .mceErrorMessage { margin-top: -12px; }.mceInput { background-color: transparent; border: 2px solid rgb(208, 208, 208); width: 60%; color: rgb(77, 77, 77); display: block; }.mceInput[type="radio"], .mceInput[type="checkbox"] { float: left; margin-right: 12px; display: inline; width: auto !important; }.mceLabel > .mceInput { margin-bottom: 0px; margin-top: 2px; }.mceLabel { display: block; }.mceText p { color: rgb(0, 0, 0); font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.25; text-align: center; letter-spacing: 0px; direction: ltr; }.mceText h1 { color: rgb(0, 0, 0); font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif; font-size: 31px; font-weight: bold; line-height: 1.5; text-align: center; letter-spacing: 0px; direction: ltr; }.mceText a { color: rgb(0, 0, 0); font-style: normal; font-weight: normal; text-decoration: underline; direction: ltr; }
@media only screen and (max-width: 480px) {
            .mceText p { font-size: 16px !important; line-height: 1.25 !important; }
          }
@media only screen and (max-width: 480px) {
            .mceText h1 { font-size: 20px !important; line-height: 1.5 !important; }
          }
@media only screen and (max-width: 480px) {
            .mceBlockContainer { padding-left: 16px !important; padding-right: 16px !important; }
          }
#dataBlockId-9 p, #dataBlockId-9 h1, #dataBlockId-9 h2, #dataBlockId-9 h3, #dataBlockId-9 h4, #dataBlockId-9 ul { text-align: center; }
@media only screen and (max-width: 480px) {
        .mobileClass-8 {padding-left: 12 !important;padding-top: 0 !important;padding-right: 12 !important;}.mobileClass-8 {padding-left: 12 !important;padding-top: 0 !important;padding-right: 12 !important;}.mobileClass-8 {padding-left: 12 !important;padding-top: 0 !important;padding-right: 12 !important;}.mobileClass-8 {padding-left: 12 !important;padding-top: 0 !important;padding-right: 12 !important;}.mobileClass-8 {padding-left: 12 !important;padding-top: 0 !important;padding-right: 12 !important;}
      }</style><script async="" crossorigin="anonymous" src="https://edge.fullstory.com/s/fs.js"></script></head>
<body>
<!--*|IF:MC_PREVIEW_TEXT|*-->
<!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;"></span><!--<![endif]-->
<!--*|END:IF|*-->
<center>
<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="background-color: rgb(247, 247, 247);">
<tbody><tr>
<td class="bodyCell" align="center" valign="top">
<table id="root" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody data-block-id="13" class="mceWrapper"><tr><td align="center" valign="top" class="mceWrapperOuter"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="660" style="width:660px;"><tr><td><![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px" role="presentation"><tbody><tr><td style="background-color:#ffffff;background-position:center;background-repeat:no-repeat;background-size:cover" class="mceWrapperInner" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="12"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0" class="mceColumn" data-block-id="-12" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:12px;padding-bottom:12px;padding-right:14px;padding-left:17px" class="mceBlockContainer" align="full" valign="top"><img data-block-id="2" width="660" height="auto" style="width:660px;height:auto;max-width:100%;max-height:100%;display:block" alt="" src="https://dim.mcusercontent.com/cs/114d023f325a61cc8f51e79b9/images/b2cfae02-0421-554a-6546-999eacb729b4.png?w=564&amp;dpr=2" role="presentation" class="imageDropZone"></td></tr><tr><td style="background-color:transparent;padding-top:5px;padding-bottom:4px;padding-right:16px;padding-left:19px" class="mceBlockContainer" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:transparent" role="presentation" data-block-id="31"><tbody><tr><td style="min-width:100%;border-top:1px solid #ebebeb" valign="top"></td></tr></tbody></table></td></tr><tr><td style="padding-top:1px;padding-bottom:1px;padding-right:24px;padding-left:24px" class="mceBlockContainer" valign="top"><div data-block-id="3" class="mceText" id="dataBlockId-3" style="width:100%"><h1 class="last-child"><span style="color:#1f1f1f;"><span style="font-family: 'DM Sans', sans-serif">Confirm your work email!</span></span></h1></div></td></tr><tr><td style="padding-top:2px;padding-bottom:2px;padding-right:24px;padding-left:24px" class="mceBlockContainer" valign="top"><div data-block-id="15" class="mceText" id="dataBlockId-15" style="width:100%"><p style="text-align: left;" class="last-child"><span style="color:#1f1f1f;"><span style="font-family: 'DM Sans', sans-serif">Hi </span></span><strong><span style="color:#1f1f1f;"><span style="font-family: 'DM Sans', sans-serif">Jakaria Hasan</span></span></strong><span style="color:#1f1f1f;"><span style="font-family: 'DM Sans', sans-serif">,<br>To proceed with the Bringin Recruiter Account verification process, kindly enter the 4-digit code provided below into your app within the next 5 minutes:</span></span></p></div></td></tr><tr><td style="padding-top:4px;padding-bottom:3px;padding-right:18px;padding-left:18px" class="mceBlockContainer" align="center" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" data-block-id="32"><tbody><tr class="mceStandardButton"><td style="background-color:#0077b5;border-radius:50px;text-align:center" class="mceButton" valign="top"><a href="" target="_blank" style="background-color:#0077b5;border-radius:50px;border:1px solid #0077b5;color:#ffffff;display:block;font-family:'DM Sans', sans-serif;font-size:18px;font-weight:bold;font-style:normal;padding:12px 28px;text-decoration:none;min-width:30px;text-align:center;direction:ltr;letter-spacing:0px">4 5 4 3</a></td></tr><tr>
<!--[if mso]>
<td align="center">
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:w="urn:schemas-microsoft-com:office:word"
href=""
style="v-text-anchor:middle; width:0px; height:0px;"
arcsize="Infinity%"
strokecolor="#0077b5"
strokeweight="1px"
fillcolor="#0077b5">
<v:stroke dashstyle="solid"/>
<w:anchorlock />
<center style="
color: #ffffff;
display: block;
font-family: 'DM Sans', sans-serif;
font-size: 18;
font-style: normal;
font-weight: bold;
letter-spacing: 0px;
text-decoration: none;
text-align: center;
direction: ltr;"
>
4 5 4 3
</center>
</v:roundrect>
</td>
<![endif]-->
</tr></tbody></table></td></tr><tr><td style="padding-top:2px;padding-bottom:2px;padding-right:24px;padding-left:24px" class="mceBlockContainer" valign="top"><div data-block-id="22" class="mceText" id="dataBlockId-22" style="width:100%"><p style="text-align: left;"><span style="font-family: 'DM Sans', sans-serif">This is an automatically generated email. If you did not request this code, please disregard this mail.</span></p><p style="text-align: left;"><br></p><p style="text-align: left;" class="last-child"><span style="color:#797979;"><span style="font-family: 'DM Sans', sans-serif">Please note that this email address is not actively monitored, and any responses may not be received or reviewed promptly.</span></span></p></div></td></tr><tr><td style="padding-top:6px;padding-bottom:6px;padding-right:24px;padding-left:24px" class="mceBlockContainer" valign="top"><div data-block-id="16" class="mceText" id="dataBlockId-16" style="width:100%"><p style="text-align: left;"><span style="color:#1f1f1f;"><span style="font-size: 14px"><span style="font-family: 'DM Sans', sans-serif">Have a question?</span></span></span></p><p style="text-align: left;" class="last-child"><span style="color:#1f1f1f;"><span style="font-size: 14px"><span style="font-family: 'DM Sans', sans-serif">Check out our help center or contact us in the app using, </span></span></span><a href="https://wa.me/8801756175141" target="_blank" style="color: #0077b5; text-decoration: none;"><strong><span style="color:#0077b5;"><span style="font-size: 14px"><span style="font-family: 'DM Sans', sans-serif">Profile&gt;Contact Us</span></span></span></strong></a></p></div></td></tr><tr><td style="background-color:transparent;padding-top:12px;padding-bottom:1px;padding-right:48px;padding-left:49px" class="mceBlockContainer" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:transparent" role="presentation" data-block-id="17"><tbody><tr><td style="min-width:100%;border-top:1px solid #dedede" valign="top"></td></tr></tbody></table></td></tr><tr><td style="background-color:#ffffff;padding-top:12px;padding-bottom:12px;padding-right:8px;padding-left:8px" class="mceLayoutContainer" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="11" id="section_7133d20b3f1eb3a85f03ae67f40588fd" class="mceFooterSection"><tbody><tr class="mceRow"><td style="background-color:#ffffff;background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px" valign="top"><table border="0" cellpadding="0" cellspacing="12" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0;margin-bottom:12px" class="mceColumn" data-block-id="-3" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:5px;padding-bottom:0;padding-right:16px;padding-left:16px" class="mceBlockContainer" align="center" valign="top"><div data-block-id="9" class="mceText" id="dataBlockId-9" style="display:inline-block;width:100%"><p><span style="font-size: 12px"><span style="font-family: 'DM Sans', sans-serif">Bringin </span></span><a href="https://bringin.io/privacypolicy" target="_blank" style="color: #0077b5; text-decoration: none;"><strong><span style="text-decoration:underline;"><span style="font-size: 12px"><span style="font-family: 'DM Sans', sans-serif">Privacy Policy</span></span></span></strong></a></p><p class="last-child"><span style="font-size: 12px"><span style="font-family: 'DM Sans', sans-serif">Plot 25, Road 04, Sector 10, Uttara, Dhaka – 1230.</span></span></p></div></td></tr><tr><td class="mceLayoutContainer" align="center" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="-2"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px" valign="top"><table border="0" cellpadding="0" cellspacing="24" width="100%" role="presentation"><tbody></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background-color:#ffffff;padding-top:9px;padding-bottom:23px;padding-right:0;padding-left:0" class="mceLayoutContainer" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="19"><tbody><tr class="mceRow"><td style="background-color:#ffffff;background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px" valign="top"><table border="0" cellpadding="0" cellspacing="24" width="100%" role="presentation"><tbody><tr><td style="margin-bottom:24px" class="mceColumn" data-block-id="-11" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="" role="presentation" class="mceClusterLayout" data-block-id="-10"><tbody><tr><td style="padding-left:6px;padding-top:0;padding-right:6px" data-breakpoint="8" valign="top" class="mobileClass-8"><a href="https://www.linkedin.com/company/bringinapp" style="display:block" target="_blank" data-block-id="-5"><img width="24" height="auto" style="border:0;width:24px;height:auto;max-width:100%;max-height:100%;display:block" alt="LinkedIn icon" src="https://dim.mcusercontent.com/https/cdn-images.mailchimp.com%2Ficons%2Fsocial-block-v3%2Fblock-icons-v3%2Flinkedin-filled-color-40.png?w=24&amp;dpr=2" class=""></a></td><td style="padding-left:6px;padding-top:0;padding-right:6px" data-breakpoint="8" valign="top" class="mobileClass-8"><a href="https://www.facebook.com/bringin.io" style="display:block" target="_blank" data-block-id="-6"><img width="24" height="auto" style="border:0;width:24px;height:auto;max-width:100%;max-height:100%;display:block" alt="Facebook icon" src="https://dim.mcusercontent.com/https/cdn-images.mailchimp.com%2Ficons%2Fsocial-block-v3%2Fblock-icons-v3%2Ffacebook-filled-color-40.png?w=24&amp;dpr=2" class=""></a></td><td style="padding-left:6px;padding-top:0;padding-right:6px" data-breakpoint="8" valign="top" class="mobileClass-8"><a href="https://www.instagram.com/bringin.io/" style="display:block" target="_blank" data-block-id="-7"><img width="24" height="auto" style="border:0;width:24px;height:auto;max-width:100%;max-height:100%;display:block" alt="Instagram icon" src="https://dim.mcusercontent.com/https/cdn-images.mailchimp.com%2Ficons%2Fsocial-block-v3%2Fblock-icons-v3%2Finstagram-filled-color-40.png?w=24&amp;dpr=2" class=""></a></td><td style="padding-left:6px;padding-top:0;padding-right:6px" data-breakpoint="8" valign="top" class="mobileClass-8"><a href="https://www.youtube.com/@Bringinapp" style="display:block" target="_blank" data-block-id="-8"><img width="24" height="auto" style="border:0;width:24px;height:auto;max-width:100%;max-height:100%;display:block" alt="YouTube icon" src="https://dim.mcusercontent.com/https/cdn-images.mailchimp.com%2Ficons%2Fsocial-block-v3%2Fblock-icons-v3%2Fyoutube-filled-color-40.png?w=24&amp;dpr=2" class=""></a></td><td style="padding-left:6px;padding-top:0;padding-right:6px" data-breakpoint="8" valign="top" class="mobileClass-8"><a href="https://twitter.com/bringinapp" style="display:block" target="_blank" data-block-id="-9"><img width="24" height="auto" style="border:0;width:24px;height:auto;max-width:100%;max-height:100%;display:block" alt="Twitter icon" src="https://dim.mcusercontent.com/https/cdn-images.mailchimp.com%2Ficons%2Fsocial-block-v3%2Fblock-icons-v3%2Ftwitter-filled-color-40.png?w=24&amp;dpr=2" class=""></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table>
</td>
</tr>
</tbody></table>
</center>
<script type="text/javascript" src="/rVzzGjTwEm1m5w1PgA/u9tYrX0kNJ/GBBTSjtmAg/cyY/ZEB0oQQ"></script></body></html>



              
              `,
        };
        transportar.sendMail(mailoption, async (err, info) => {
          if (err) {
            res.status(400).send(err);
          } else {
            await Recruiters.findByIdAndUpdate(
              { _id: _id },
              { $set: { "other.profile_docupload": true } }
            );
            res.status(200).send("verification code send successfull");
          }
        });
      } else if (req.body.type == 5) {
        var verifydata = await ProfileVerify.findOne({ userid: _id });
        if (verifydata == null) {
          ProfileVerify({
            userid: _id,
            fieldname: null,
            originalname: null,
            encoding: null,
            mimetype: null,
            destination: null,
            filename: null,
            path: null,
            size: 0,
            type: req.body.type,
            link: req.body.link,
          }).save();
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            { $set: { "other.profile_docupload": true } }
          );
          res.status(200).send("send successfull");
        } else {
          await ProfileVerify.findOneAndUpdate(
            { userid: _id },
            {
              $set: {
                fieldname: null,
                originalname: null,
                encoding: null,
                mimetype: null,
                destination: null,
                filename: null,
                path: null,
                size: 0,
                type: req.body.type,
                link: req.body.link,
              },
            }
          );
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            { $set: { "other.profile_docupload": true } }
          );
          res.status(200).send("send successfull");
        }
      } else {
        var verifydata = await ProfileVerify.findOne({ userid: _id });
        if (verifydata == null) {
          ProfileVerify({
            userid: _id,
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            type: req.body.type,
            link: "",
          }).save();
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            { $set: { "other.profile_docupload": true } }
          );
          res.status(200).send("send successfull");
        } else {
          await ProfileVerify.findOneAndUpdate(
            { userid: _id },
            {
              $set: {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                encoding: req.file.encoding,
                mimetype: req.file.mimetype,
                destination: req.file.destination,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                type: req.body.type,
                link: "",
              },
            }
          );
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            { $set: { "other.profile_docupload": true } }
          );
          res.status(200).send("send successfull");
        }
      }
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

app.post("/email_code_verify", tokenverify, (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const number = req.userNumber;

    const otpHolder = Otp.find({
      number: number,
    });
    if (otpHolder.length === 0)
      return res.status(400).send("You use an Expired OTP!");
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = bcrypt.compare(req.body.otp, rightOtpFind.otp);
    if (rightOtpFind.number === number && validUser) {
      Otp.deleteMany({
        number: rightOtpFind.number,
      });
      Recruiters.findByIdAndUpdate(
        { _id: _id },
        { $set: { "other.profile_verify": true } }
      );
      return res.status(200).json({
        message: "Verified Succefully",
      });
    } else {
      return res.status(400).send("Your OTP was wrong!");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

let htmltext = `  

`;

module.exports = app;
