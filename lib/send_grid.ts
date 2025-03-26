import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailData {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    await sgMail.send(data);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
};