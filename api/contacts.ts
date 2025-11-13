import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate email HTML
function generateContactEmailHTML(params: {
  name: string;
  email: string;
  message: string;
  interestedEvent?: string;
}): string {
  const { name, email, message, interestedEvent } = params;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B6F47; border-bottom: 2px solid #C17C5C; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>

      <div style="margin-top: 20px; line-height: 1.6;">
        <p style="margin-bottom: 15px;">
          <strong style="color: #8B6F47;">From:</strong> ${name}
        </p>

        <p style="margin-bottom: 15px;">
          <strong style="color: #8B6F47;">Email:</strong>
          <a href="mailto:${email}" style="color: #C17C5C;">${email}</a>
        </p>

        ${interestedEvent ? `
        <p style="margin-bottom: 15px;">
          <strong style="color: #8B6F47;">Interested in Event:</strong>
          <span style="background-color: #FAF6F1; padding: 4px 8px; border-radius: 4px; color: #8B6F47;">
            ${interestedEvent}
          </span>
        </p>
        ` : ''}

        <div style="margin-top: 20px;">
          <strong style="color: #8B6F47;">Message:</strong>
          <div style="margin-top: 10px; padding: 15px; background-color: #FAF6F1; border-left: 4px solid #C17C5C; border-radius: 4px; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5DED3; color: #8B6F47; font-size: 12px;">
        <p>This message was sent from the Nushu Culture & Research Association website contact form.</p>
      </div>
    </body>
    </html>
  `;
}

// Contact model definition (inline to avoid import issues)
interface IContact extends mongoose.Document {
  name: string;
  email: string;
  message: string;
  interestedEvent?: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  response?: string;
}

const contactSchema = new mongoose.Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxLength: [2000, 'Message cannot exceed 2000 characters']
  },
  interestedEvent: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded', 'archived'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  respondedAt: {
    type: Date
  },
  response: {
    type: String,
    trim: true,
    maxLength: [2000, 'Response cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);

// Database connection helper
let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    const { method, query } = req;
    const contactId = query.contactId as string;

    switch (method) {
      case 'GET':
        if (contactId) {
          // Get single contact
          const contact = await Contact.findById(contactId);
          if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
          }
          return res.json({ success: true, data: contact });
        } else {
          // Get all contacts with filters
          const {
            status,
            limit = '50',
            page = '1',
            search
          } = query;

          const filters: any = {};
          if (status && status !== 'all') {
            filters.status = status;
          }
          if (search) {
            filters.$or = [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { message: { $regex: search, $options: 'i' } }
            ];
          }

          const limitNum = Math.min(parseInt(limit as string) || 50, 100);
          const pageNum = parseInt(page as string) || 1;
          const skip = (pageNum - 1) * limitNum;

          const [contacts, total, statusCounts] = await Promise.all([
            Contact.find(filters)
              .sort({ createdAt: -1 })
              .limit(limitNum)
              .skip(skip),
            Contact.countDocuments(filters),
            Contact.aggregate([
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
          ]);

          const statusCountsObj = statusCounts.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {});

          return res.json({
            success: true,
            data: {
              contacts,
              pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                limit: limitNum,
                count: contacts.length,
                totalRecords: total
              },
              statusCounts: {
                new: statusCountsObj.new || 0,
                read: statusCountsObj.read || 0,
                responded: statusCountsObj.responded || 0,
                archived: statusCountsObj.archived || 0,
                total
              }
            }
          });
        }

      case 'POST':
        try {
          // Submit new contact (public endpoint)
          console.log('=== POST /contacts - Start ===');
          console.log('Request body:', req.body);

          const { name, email, message, interestedEvent } = req.body;

          if (!name || !email || !message) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
              success: false,
              message: 'Name, email, and message are required'
            });
          }

          const contactData: any = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            interestedEvent: interestedEvent || '',
            status: 'new'
          };

          // Add IP address if available
          const forwarded = req.headers['x-forwarded-for'];
          const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.connection?.remoteAddress;
          if (ip) {
            contactData.ipAddress = ip;
          }

          // Add user agent if available
          if (req.headers['user-agent']) {
            contactData.userAgent = req.headers['user-agent'];
          }

          console.log('Saving contact to database...');
          const newContact = new Contact(contactData);
          await newContact.save();
          console.log('Contact saved successfully:', newContact._id);

          // Send email notification using Resend
          console.log('Attempting to send email notification...');
          try {
            const contactEmail = process.env.CONTACT_EMAIL;
            const resendApiKey = process.env.RESEND_API_KEY;

            console.log('CONTACT_EMAIL configured:', !!contactEmail);
            console.log('RESEND_API_KEY configured:', !!resendApiKey);

            if (!contactEmail) {
              console.warn('⚠️  CONTACT_EMAIL not configured, skipping email notification');
            } else if (!resendApiKey) {
              console.warn('⚠️  RESEND_API_KEY not configured, skipping email notification');
            } else {
              console.log('Generating email HTML...');
              const emailHTML = generateContactEmailHTML({
                name: contactData.name,
                email: contactData.email,
                message: contactData.message,
                interestedEvent: contactData.interestedEvent
              });

              console.log('Sending email via Resend...');
              console.log('To:', contactEmail);
              console.log('Subject:', `New Contact Form Submission from ${name}`);

              const emailResult = await resend.emails.send({
                from: 'Nushu Association <onboarding@resend.dev>',
                to: [contactEmail],
                subject: `New Contact Form Submission from ${name}`,
                html: emailHTML
              });

              console.log('✅ Email sent successfully:', emailResult);
            }
          } catch (emailError) {
            // Log error but don't fail the contact submission
            console.error('❌ Failed to send email notification:', emailError);
            if (emailError instanceof Error) {
              console.error('Email error message:', emailError.message);
              console.error('Email error stack:', emailError.stack);
            }
            // Don't throw - we want contact submission to succeed even if email fails
          }

          console.log('Returning success response...');
          return res.status(201).json({
            success: true,
            data: {
              id: newContact._id,
              timestamp: newContact.createdAt
            },
            message: 'Contact submitted successfully'
          });
        } catch (postError) {
          console.error('=== POST /contacts - Error ===');
          console.error('Error:', postError);
          if (postError instanceof Error) {
            console.error('Error message:', postError.message);
            console.error('Error stack:', postError.stack);
          }

          return res.status(500).json({
            success: false,
            message: 'Failed to submit contact form',
            error: process.env.NODE_ENV === 'development' ? String(postError) : 'Internal server error'
          });
        }

      case 'PUT':
        // Update contact status (admin only)
        if (!contactId) {
          return res.status(400).json({ success: false, message: 'Contact ID required' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { status, response } = req.body;
        const updateData: any = { status };
        
        if (response) {
          updateData.response = response;
          updateData.respondedAt = new Date();
        }

        const updatedContact = await Contact.findByIdAndUpdate(contactId, updateData, { new: true });
        
        if (!updatedContact) {
          return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        return res.json({
          success: true,
          data: updatedContact,
          message: 'Contact updated successfully'
        });

      case 'DELETE':
        // Delete contact (admin only)
        if (!contactId) {
          return res.status(400).json({ success: false, message: 'Contact ID required' });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const deletedContact = await Contact.findByIdAndDelete(contactId);
        
        if (!deletedContact) {
          return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        return res.json({
          success: true,
          message: 'Contact deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

export default handler;
