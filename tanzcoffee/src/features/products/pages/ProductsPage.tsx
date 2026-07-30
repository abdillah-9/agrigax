import { useEffect } from 'react';
import { GiCoffeeBeans } from 'react-icons/gi';
import roasterPic from '../../../assets/roaster.webp';
import unionPic from '../../../assets/unionCroped.webp';
import traderPic from '../../../assets/traderCroped.webp';
import manufacturerPic from '../../../assets/IMG-20240215-WA0016.webp';
import arabicaBeansPic from '../../../assets/beans.webp';
import robustaCoffeePic from '../../../assets/robustaCoffee2.webp';
import robustaBeansPic from '../../../assets/IMG_20241004_114341_116Croped.webp';
import robustaSVG from '../../../assets/robusta.svg';
import soybeansPic from '../../../assets/soyabeans2.webp';
import sesameSeedsPic from '../../../assets/sesameseeds.webp';
import cashewNutsPic from '../../../assets/cashewnuts.webp';
import ricePic from '../../../assets/rice.webp';
import allBeansPic from '../../../assets/allbeans.webp';
import whiteMaizePic from '../../../assets/whiteMaize.webp';
import weServe1Pic from '../../../assets/weServe1.webp';
import weServe2Pic from '../../../assets/weServe2.webp';
import weServe3Pic from '../../../assets/weServe3.webp';

const qualityRequirements = [
  'Storage Temperature 18 – 20 degrees centigrade',
  'Moisture: Not less than 12% max',
  'Foreign matters: 0.5%',
  'Humidity 55% - 70%',
];

const whoWeServe = [
  'Coffee Roasters',
  'Coffee Cooperative Unions',
  'Instant Coffee Traders',
  'Coffee Products Manufacturers',
];

const otherProducts = [
  { className: 'slide1', img: soybeansPic, label: 'Soybeans' },
  { className: 'slide2', img: sesameSeedsPic, label: 'Sesame seeds' },
  { className: 'slide3', img: cashewNutsPic, label: 'Cashew nuts' },
  { className: 'slide4', img: ricePic, label: 'Rice' },
  { className: 'slide5', img: allBeansPic, label: 'Beans of all types' },
  { className: 'slide6', img: whiteMaizePic, label: 'Maize' },
];

function ProductsPage() {
  const pics = [
    roasterPic,
    unionPic,
    traderPic,
    manufacturerPic,
    arabicaBeansPic,
    robustaCoffeePic,
    robustaBeansPic,
    robustaSVG,
    soybeansPic,
    sesameSeedsPic,
    cashewNutsPic,
    ricePic,
    allBeansPic,
    whiteMaizePic,
    weServe1Pic,
    weServe2Pic,
    weServe3Pic,
  ];

  useEffect(() => {
    pics.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          padding: '0px 10px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">Our Products</div>
        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '18px',
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          We offer non-GMO Arabica and Robusta Green Coffee Products
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '90px',
            padding: '15px 0px 55px 0px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              className="productAvatar"
              style={{ borderRadius: '50%', width: '170px', height: '160px', objectFit: 'cover' }}
              src={robustaCoffeePic}
              alt="natural beans"
            />
            <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500 }}>
              Natural Green Coffee
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              className="productAvatar"
              style={{ borderRadius: '50%', width: '170px', height: '160px', objectFit: 'cover' }}
              src={arabicaBeansPic}
              alt="natural beans"
            />
            <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500 }}>
              Arabica Green Coffee Beans
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              className="productAvatar"
              style={{ borderRadius: '50%', width: '170px', height: '160px', objectFit: 'cover' }}
              src={robustaBeansPic}
              alt="natural beans"
            />
            <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500 }}>
              Robusta Green Coffee Beans
            </div>
          </div>
        </div>

        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '18px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Our products fall under the following coffee grade size
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '100px',
            justifyContent: 'center',
            paddingBottom: '50px',
            width: '100vw',
          }}
        >
          <div
            className="liftCard"
            style={{
              width: '50%',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: '12px',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: 'white',
              borderLeft: '6px solid #dd9d6dff',
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
                <GiCoffeeBeans style={{ fontSize: '25px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px', paddingBottom: '10px' }}>
                Arabica Coffee
              </span>
              <p style={{ fontSize: '15px' }}> AAA, AA, AB, B , PB</p>
            </div>
          </div>

          <div
            className="liftCard"
            style={{
              width: '50%',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: '12px',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: 'white',
              borderLeft: '6px solid #dd9d6dff',
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
                <img alt="robusatSVG" src={robustaSVG} style={{ width: '20px', height: '20px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px', paddingBottom: '10px' }}>
                Robusta Coffee
              </span>
              <p style={{ fontSize: '15px' }}> Screen 18, Screen 16, Screen 14,</p>
              <p style={{ fontSize: '15px' }}> Screen 12, TR</p>
            </div>
          </div>
        </div>

        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '16px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Our coffee products meet the following quality requirements
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            padding: '30px',
          }}
        >
          {qualityRequirements.map((requirement) => (
            <div
              key={requirement}
              className="liftCard"
              style={{
                background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
                borderRadius: '999px',
                padding: '14px 22px',
                color: 'white',
                fontWeight: 500,
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 1,
                minWidth: '270px',
              }}
            >
              {requirement}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '23px',
            color: 'white',
            background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
            padding: '40px 20px 55px 20px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className="opacityAnimation"
        >
          <div className="sectionTitle onColor" style={{ width: '100%' }}>
            Who We Serve
          </div>
          <div
            style={{
              color: 'rgba(54, 35, 17, 1)',
              width: '100%',
              paddingBottom: '15px',
              fontSize: '18px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            We are an international company and we serve both local and international coffee
            corporations with a diverse range of industries, including the following
          </div>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              padding: '20px 0px',
            }}
          >
            {whoWeServe.map((client) => (
              <div
                key={client}
                className="liftCard"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--ink)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  fontWeight: 600,
                  borderLeft: '5px solid var(--brand-green)',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  flexGrow: 1,
                  minWidth: '290px',
                }}
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100vw',
          padding: '50px 0px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: ' center',
          gap: '50px',
        }}
      >
        {[roasterPic, unionPic, traderPic, weServe1Pic, weServe2Pic, weServe3Pic].map((pic) => (
          <div
            key={pic}
            className="galleryTile"
            style={{
              backgroundImage: `url(${pic})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'white',
              color: 'black',
              width: '100%',
              borderRadius: '14px',
              maxWidth: '300px',
              flexGrow: 1,
              display: 'flex',
              height: '200px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 0px 60px 0px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">Other Products</div>
        <div style={{ color: 'rgba(185, 130, 12, 1)', width: '85vw', maxWidth: '700px', fontSize: '16px' }}>
          In addition to coffee, the company also supplies the following products. Maize, Rice,
          Soybeans, All type of beans and Cashew-nuts
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '30px',
            width: '100vw',
            padding: '50px 0px 0px 0px',
          }}
          className="slidesGap"
        >
          {otherProducts.map((product) => (
            <div
              key={product.label}
              className={product.className}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '10%',
                minWidth: '150px',
                gap: '3px',
                padding: '50px 0px',
              }}
            >
              <img
                src={product.img}
                alt="pic1"
                style={{
                  width: '50px',
                  objectFit: 'cover',
                  aspectRatio: 1 / 0.9,
                  borderRadius: '50%',
                }}
              />
              <div style={{ fontSize: '5px' }}>{product.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
