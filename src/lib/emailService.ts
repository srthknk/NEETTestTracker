import nodemailer from 'nodemailer';
import { ITest } from '@/types';

// Create email transporter
const createTransporter = () => {
  const emailUser = process.env.GMAIL_USER;
  const emailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('Gmail credentials not configured. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

interface EmailRecipient {
  email: string;
  name: string;
}

interface SendTestNotificationParams {
  studentEmail: string;
  studentName: string;
  parentEmails?: string[];
  parentName?: string;
  testName: string;
  totalMarks: number;
  testData: ITest;
  pdfBuffer: Buffer;
}

export const sendTestNotification = async (params: SendTestNotificationParams) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured');
    return false;
  }

  const {
    studentEmail,
    studentName,
    parentEmails,
    parentName,
    testName,
    totalMarks,
    testData,
    pdfBuffer,
  } = params;

  // Prepare email content
  const emailSubject = `🎉 Practice Test Completed: ${testName} - ${totalMarks}/720 Marks`;

  const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Test Completed Successfully! 🎉</h1>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-top: 0;">Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Test Name:</td>
                <td style="padding: 10px;">${testName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Total Marks:</td>
                <td style="padding: 10px;">${totalMarks}/720</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Percentile:</td>
                <td style="padding: 10px;">${(testData.overallPercentile || 0).toFixed(1)}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Test Date:</td>
                <td style="padding: 10px;">${new Date(testData.date).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Coaching Test Attempted:</td>
                <td style="padding: 10px;">${testData.coaching}</td>
              </tr>
            </table>

            <h3 style="color: #000; margin-top: 20px;">Subject-wise Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f0f0f0; border-bottom: 1px solid #ddd;">
                <th style="padding: 10px; text-align: left; font-weight: bold;">Subject</th>
                <th style="padding: 10px; text-align: left; font-weight: bold;">Marks</th>
                <th style="padding: 10px; text-align: left; font-weight: bold;">Percentile</th>
              </tr>
              ${Object.entries(testData.subjectWiseMarks || {})
                .map(
                  ([subject, marks]: any) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; text-transform: capitalize;">${subject}</td>
                  <td style="padding: 10px;">${marks.obtained}/${marks.total}</td>
                  <td style="padding: 10px;">${(
                    testData.subjectWisePercentiles?.[subject as keyof typeof testData.subjectWisePercentiles] || 0
                  ).toFixed(1)}%</td>
                </tr>
              `
                )
                .join('')}
            </table>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0099cc;">
            <p style="margin: 0; color: #0099cc;"><strong>📎 Detailed PDF Report:</strong> Please find the complete test report attached as PDF.</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p>This is an automated notification from Sarthak's NEET Preparation Tracker</p>
            <p>Keep practicing, all the best! 🚀</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Send email to student
    const studentMailOptions = {
      from: process.env.GMAIL_USER,
      to: studentEmail,
      subject: emailSubject,
      html: emailBody,
      attachments: [
        {
          filename: `${testName.replace(/\s+/g, '_')}_Report.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(studentMailOptions);
    console.log(`✓ Email sent to student: ${studentEmail}`);

    // Send email to parent(s) if parent emails exist
    if (parentEmails && parentEmails.length > 0) {
      for (const parentEmail of parentEmails) {
        if (!parentEmail || !parentEmail.trim()) continue;
        
        const parentMailOptions = {
          from: process.env.GMAIL_USER,
          to: parentEmail,
          subject: `[Practice Test Parent Notification for ${studentName}] ${emailSubject}`,
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 24px;">Practice Test Completion Notification</h1>
                  </div>

                  <p style="font-size: 16px;">Dear ${parentName || 'Parent'},</p>

                  <p>This is to notify you that <strong>${studentName}</strong> has completed a Practice Test on the Sarthak's NEET Preparation Tracker platform.</p>

                  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #000; margin-top: 0;">Test Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Student Name:</td>
                        <td style="padding: 10px;">${studentName}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Test Name:</td>
                        <td style="padding: 10px;">${testName}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Total Marks:</td>
                        <td style="padding: 10px;">${totalMarks}/720</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px; font-weight: bold;">Percentile:</td>
                        <td style="padding: 10px;">${(testData.overallPercentile || 0).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold;">Test Date:</td>
                        <td style="padding: 10px;">${new Date(testData.date).toLocaleDateString('en-IN')}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #0099cc;">
                    <p style="margin: 0; color: #0099cc;"><strong>📎 Full Report:</strong> The detailed PDF report has been attached to your email for your records.</p>
                  </div>

                  <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p>This is an automated notification from Sarthak's NEET Tracker</p>
                    <p>Best wishes for ${studentName}'s NEET preparation! 🎓</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          attachments: [
            {
              filename: `${testName.replace(/\s+/g, '_')}_Report.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        };

        await transporter.sendMail(parentMailOptions);
        console.log(`✓ Email sent to parent: ${parentEmail}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
