import type { ReactNode } from 'react';
import { GiCoffeeBeans, GiFarmer } from 'react-icons/gi';
import { PiShoppingCart } from 'react-icons/pi';
import { FaWarehouse, FaBookOpenReader, FaHandHoldingHand } from 'react-icons/fa6';
import servicesVideoHevc from '../../../assets/videoServices.mp4';
import servicesVideoH264 from '../../../assets/videoServices_h264.mp4';
import servicesVideoWebm from '../../../assets/videoServices.webm';

const services: { icon: ReactNode; text: string }[] = [
  {
    icon: <GiCoffeeBeans style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Processing premium Robusta green coffee products to suit international market requirements.',
  },
  {
    icon: <PiShoppingCart style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Providing a ready market for the increasing coffee production across Kagera region',
  },
  {
    icon: <GiFarmer style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Supplying of quality farming equipment, seeds, pesticides and farming gears.',
  },
  {
    icon: <FaWarehouse style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Storage services of other farmers’ products in our facilities during off-seasons periods.',
  },
  {
    icon: <FaBookOpenReader style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Company registration services to both local and foreign nationals.',
  },
  {
    icon: <FaHandHoldingHand style={{ fontSize: '25px', color: 'black' }} />,
    text: 'Export and Import trade consultation services',
  },
];

function ServicesPage() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '50px',
        padding: '20px 0px 20px 0px',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '200px',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">Business Services</div>
        <div style={{ color: '#dd9d6dff', width: '85vw', maxWidth: '700px', fontSize: '16px' }}>
          TanzCoffee Trading Company Limited is a Tanzanian coffee processing and exporting company. We
          have our processing facilities located in Karagwe District, Kagera, Tanzania and we are
          planning to establish our administration office in Dar es Salaam, Tanzania.
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '10px',
            color: 'white',
            padding: '10px 15px',
          }}
          className="opacityAnimation"
        >
          {services.map((service, index) => (
            <div
              key={index}
              className="liftCard"
              style={{
                background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
                color: 'white',
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)',
                maxWidth: '400px',
                flexGrow: 1,
                padding: '1px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '16px 16px 0px 0px',
                  padding: '20px 0px',
                }}
              >
                <div
                  style={{
                    padding: '25px 30px',
                    borderRadius: '50%',
                    backgroundColor: '#faf3ec',
                    boxShadow: '0 6px 18px rgba(38, 34, 28, 0.18)',
                  }}
                >
                  {service.icon}
                </div>
              </div>
              <p style={{ padding: '12px 16px', color: 'white', fontWeight: 500 }}>{service.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100vw',
          padding: '60px',
          gap: '40px',
          backgroundColor: 'white',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            minWidth: '200px',
            flexGrow: 1,
            aspectRatio: 1 / 0.7,
            width: '40%',
          }}
        >
          <video
            style={{
              objectFit: 'cover',
              width: '100%',
              aspectRatio: 1 / 1,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-soft)',
            }}
            autoPlay
            loop
            controls
            muted
            preload="auto"
          >
            <source src={servicesVideoHevc} type="video/mp4; codecs=hev1" />
            <source src={servicesVideoH264} type="video/mp4" />
            <source src={servicesVideoWebm} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div
          style={{
            maxWidth: '500px',
            minWidth: '200px',
            display: 'flex',
            flexGrow: 1,
            fontSize: '18px',
            width: '40%',
            textAlign: 'justify',
            fontWeight: 500,
            color: 'black',
          }}
        >
          The purpose of this brief video is to provide potential customers with a quick overview of our
          business practices. The video is a brief demonstration of how we purchase, where we purchase
          from, how we process, how we inspect for quality, how we pack, how we export, and how quality
          is our top concern. I appreciate you watching
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;
