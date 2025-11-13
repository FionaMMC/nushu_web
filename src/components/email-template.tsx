import * as React from 'react';

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  message: string;
  interestedEvent?: string;
}

export function ContactEmailTemplate({
  name,
  email,
  message,
  interestedEvent
}: ContactEmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#8B6F47', borderBottom: '2px solid #C17C5C', paddingBottom: '10px' }}>
        New Contact Form Submission
      </h2>

      <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '15px' }}>
          <strong style={{ color: '#8B6F47' }}>From:</strong> {name}
        </p>

        <p style={{ marginBottom: '15px' }}>
          <strong style={{ color: '#8B6F47' }}>Email:</strong>{' '}
          <a href={`mailto:${email}`} style={{ color: '#C17C5C' }}>{email}</a>
        </p>

        {interestedEvent && (
          <p style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#8B6F47' }}>Interested in Event:</strong>{' '}
            <span style={{
              backgroundColor: '#FAF6F1',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#8B6F47'
            }}>
              {interestedEvent}
            </span>
          </p>
        )}

        <div style={{ marginTop: '20px' }}>
          <strong style={{ color: '#8B6F47' }}>Message:</strong>
          <div style={{
            marginTop: '10px',
            padding: '15px',
            backgroundColor: '#FAF6F1',
            borderLeft: '4px solid #C17C5C',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {message}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #E5DED3',
        color: '#8B6F47',
        fontSize: '12px'
      }}>
        <p>This message was sent from the Nushu Culture & Research Association website contact form.</p>
      </div>
    </div>
  );
}
