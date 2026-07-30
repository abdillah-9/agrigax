import { useRef, useState, type FormEvent } from 'react';
import { IoCallOutline, IoLocationOutline } from 'react-icons/io5';
import { MdOutlineEmail } from 'react-icons/md';
import { CgSpinner } from 'react-icons/cg';

function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await (
        await fetch('https://www.tanzcoffee.co.tz/api/sendEmail.php', {
          method: 'POST',
          body: formData,
        })
      ).json();
      if (response.status === 'success') {
        alert('Message is successfully sent to TanzCoffee L.t.d');
        (event.target as HTMLFormElement).reset();
      } else {
        alert('Something went wrong: ' + response.message);
      }
    } catch {
      alert('Network error — please try again later.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '30px',
        padding: '20px 0px 0px 0px',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '200px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">Contact Us</div>
        <div
          style={{
            color: '#a8510eff',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '19px',
            textAlign: 'center',
            paddingBottom: '20px',
          }}
        >
          Get in touch with us for Inquiries, Business Services and Feedback
        </div>

        <div
          style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0px 10px 25px 10px',
          }}
        >
          <div
            className="btnPrimary"
            style={{ padding: '15px 32px', fontSize: '17px' }}
            onClick={scrollToForm}
          >
            Send Message
          </div>
          <a
            href="tel:+255788491086"
            className="btnOutline"
            style={{ padding: '13px 32px', fontSize: '17px' }}
          >
            Call Us Now
          </a>
        </div>

        <div
          style={{
            fontSize: '18px',
            fontWeight: 500,
            textAlign: 'center',
            fontStyle: 'italic',
            maxWidth: '85vw',
          }}
        >
          We strongly urge all business communications from clients to use the contact details shown
          below. The company will not be responsible for any losses incurred by clients who do not use
          these contact details
        </div>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '50px',
          background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
          padding: '50px 15px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '420px', flexGrow: 1 }}
        >
          <div
            className="liftCard"
            style={{
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: '12px',
              borderRadius: '16px',
              padding: '14px',
              backgroundColor: 'white',
              borderLeft: '8px solid var(--brand-green)',
              flexGrow: 1,
              maxHeight: '170px',
            }}
          >
            <div style={{ padding: '10px' }}>
              <div
                style={{
                  borderRadius: '50%',
                  padding: '9px 12px',
                  backgroundColor: '#faf3ec',
                  boxShadow: '0 6px 18px rgba(38, 34, 28, 0.18)',
                }}
              >
                <IoLocationOutline style={{ fontSize: '25px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '18px' }}>Physical address:</span>
              <p style={{ fontSize: '16px' }}>
                Rugarama Street, Kyerwa Road, (Omurushaka) Bugene, Karagwe District.
              </p>
              <p style={{ fontSize: '16px' }}>P. O. Box 265 Kagera Tanzania.</p>
            </div>
          </div>

          <div
            className="liftCard"
            style={{
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: '12px',
              borderRadius: '16px',
              padding: '14px',
              backgroundColor: 'white',
              borderLeft: '8px solid var(--brand-green)',
              flexGrow: 1,
              maxHeight: '100px',
            }}
          >
            <div style={{ padding: '10px' }}>
              <div
                style={{
                  borderRadius: '50%',
                  padding: '9px 12px',
                  backgroundColor: '#faf3ec',
                  boxShadow: '0 6px 18px rgba(38, 34, 28, 0.18)',
                }}
              >
                <IoCallOutline style={{ fontSize: '25px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '18px' }}>Phone number:</span>
              <p style={{ fontSize: '16px' }}>+255 788491086</p>
            </div>
          </div>

          <div
            className="liftCard"
            style={{
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: '12px',
              borderRadius: '16px',
              padding: '14px',
              backgroundColor: 'white',
              borderLeft: '8px solid var(--brand-green)',
              flexGrow: 1,
              maxHeight: '100px',
            }}
          >
            <div style={{ padding: '10px' }}>
              <div
                style={{
                  borderRadius: '50%',
                  padding: '9px 12px',
                  backgroundColor: '#faf3ec',
                  boxShadow: '0 6px 18px rgba(38, 34, 28, 0.18)',
                }}
              >
                <MdOutlineEmail style={{ fontSize: '25px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '18px' }}>Email:</span>
              <p style={{ fontSize: '16px' }}>info@tanzcoffee.co.tz</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          ref={formRef}
          style={{
            flexGrow: 1,
            display: 'flex',
            maxWidth: '550px',
            flexDirection: 'column',
            gap: '35px',
            padding: '60px',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-hover)',
            backgroundColor: 'white',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 600, fontSize: '15px' }}>Your Name</label>
            <input
              type="text"
              required
              name="name"
              placeholder="Enter your full name"
              className="formInput"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 600, fontSize: '15px' }}>Your Email</label>
            <input
              required
              type="email"
              name="email"
              placeholder="Enter your email address"
              className="formInput"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 600, fontSize: '15px' }}>Your Subject</label>
            <input
              required
              type="text"
              name="subject"
              placeholder="Enter message subject"
              className="formInput"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontWeight: 600, fontSize: '15px' }}>Your Message</label>
            <textarea
              required
              name="message"
              placeholder="Enter your message here..."
              className="formInput"
              style={{ resize: 'vertical' }}
              rows={10}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            {sending ? (
              <CgSpinner style={{ fontSize: '30px', color: '#dd9d6dff' }} className="spinner" />
            ) : (
              ''
            )}
            <input
              type="submit"
              name="submit"
              className="btnPrimary"
              style={{ padding: '14px 28px', fontSize: '16px', width: '100%' }}
              value="SEND MESSAGE"
            />
          </div>
        </form>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '70px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">Find Us</div>
        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '19px',
            textAlign: 'center',
          }}
        >
          Visit our processing facilities in Bugene, Karagwe Kagera, Tanzania
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-soft)',
            overflow: 'hidden',
            minWidth: '80vw',
            height: '70vh',
            marginTop: '20px',
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d417.39524678927626!2d31.1279223!3d-1.5811336!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzQnNTEuOSJTIDMxwrAwNyc0MS4xIkU!5e1!3m2!1sen!2stz!4v1763968543797!5m2!1sen!2stz"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div
          style={{
            width: '100%',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-soft)',
            backgroundColor: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            minWidth: '80vw',
            justifyContent: 'space-between',
            padding: '30px',
            margin: '50px 0px',
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '500px', flexGrow: 1 }}
          >
            <div style={{ fontSize: '18px', fontWeight: 500, paddingBottom: '10px' }}>Office Hours</div>
            <div style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(150,150,150,1)' }}>
              Monday - Friday: Open
            </div>
            <div style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(150,150,150,1)' }}>
              Saturday - Sunday: Closed
            </div>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '500px', flexGrow: 1 }}
          >
            <div style={{ fontSize: '18px', fontWeight: 500, paddingBottom: '10px' }}>Getting Here</div>
            <div style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(150,150,150,1)' }}>
              Located on Bugene Road in Kayanga, Karagwe District. Easily accessible by public transport
              or private vehicle.
            </div>
          </div>
          <div
            className="btnPrimary"
            style={{
              fontSize: '15px',
              padding: '15px 22px',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              gap: '6px',
            }}
          >
            {' '}
            <IoLocationOutline style={{ fontSize: '22px', color: 'white' }} className="whiteColor" />
            <a
              href="https://maps.app.goo.gl/tuMo97WxvmmV1xYa6"
              target="_blank"
              className="whiteColor"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
