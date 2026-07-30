import { useEffect } from 'react';
import { FaRegEye } from 'react-icons/fa6';
import { GiFlyingFlag, GiDiamondHard } from 'react-icons/gi';
import sospeterPic from '../../../assets/SospeterPic2New.webp';
import evodiusPic from '../../../assets/Evodius.webp';
import omaryPic from '../../../assets/Omary.webp';
import investorDeckPic from '../../../assets/TanzCoffee_Investor_Deck.webp';

function AboutPage() {
  const pics = [sospeterPic, evodiusPic, omaryPic, investorDeckPic];

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
          gap: '20px',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle">About Us</div>
        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '16px',
            textAlign: 'center',
          }}
        >
          TanzCoffee Trading Company Limited is a Tanzanian coffee processing and exporting company. We
          have our processing facilities located in Karagwe District, Kagera, Tanzania and we are
          planning to establish our administration office in Dar es Salaam, Tanzania.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: '0px 15px',
          gap: '20px',
          width: '100%',
        }}
      >
        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minWidth: '200px',
            maxWidth: '380px',
            width: '25%',
            flexGrow: 1,
            borderRadius: '20px',
            borderBottom: '8px solid #dd9d6dff',
            boxShadow: 'var(--shadow-soft)',
            backgroundColor: 'white',
            padding: '28px 20px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              boxShadow: '0 6px 18px rgba(38, 34, 28, 0.15)',
              backgroundColor: '#faf3ec',
              display: 'flex',
              justifyContent: 'center',
              padding: '14px',
              borderRadius: '50%',
              width: 'fit-content',
            }}
          >
            <FaRegEye style={{ fontSize: '40px' }} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, textAlign: 'center' }}>Vision</div>
          <div style={{ textAlign: 'left' }}>
            Dedicated to be the leading world-class green coffee processing and supplying company.
          </div>
        </div>

        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minWidth: '200px',
            maxWidth: '380px',
            width: '25%',
            flexGrow: 1,
            borderRadius: '20px',
            borderBottom: '8px solid #dd9d6dff',
            boxShadow: 'var(--shadow-soft)',
            backgroundColor: 'white',
            padding: '28px 20px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              boxShadow: '0 6px 18px rgba(38, 34, 28, 0.15)',
              backgroundColor: '#faf3ec',
              display: 'flex',
              justifyContent: 'center',
              padding: '14px',
              borderRadius: '50%',
              width: 'fit-content',
            }}
          >
            <GiFlyingFlag style={{ fontSize: '40px' }} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, textAlign: 'center' }}>Mission</div>
          <div style={{ textAlign: 'left' }}>
            Sustainable processing of high quality and quantity coffee beans by utilizing sophisticated
            machines and maintaining positive business relationship with clients and regional farmers.
          </div>
        </div>

        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minWidth: '200px',
            maxWidth: '380px',
            width: '25%',
            flexGrow: 1,
            borderRadius: '20px',
            borderBottom: '8px solid #dd9d6dff',
            boxShadow: 'var(--shadow-soft)',
            backgroundColor: 'white',
            padding: '28px 20px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              boxShadow: '0 6px 18px rgba(38, 34, 28, 0.15)',
              backgroundColor: '#faf3ec',
              display: 'flex',
              justifyContent: 'center',
              padding: '14px',
              borderRadius: '50%',
              width: 'fit-content',
            }}
          >
            <GiDiamondHard style={{ fontSize: '40px' }} />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, textAlign: 'center' }}>Core-value</div>
          <div style={{ textAlign: 'left' }}>
            <div>•	We value collaboration and partnership for growth.</div>
            <div>•	We embrace new technologies for improvement.</div>
            <div>•	Environment Sustainability.</div>
            <div>•	Diversity in the workforce.</div>
            <div>•	Social Responsibility.</div>
            <div>•	Professionalism.</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
          width: '100%',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: '45px 15px 70px 15px',
          gap: '20px',
        }}
      >
        <div className="sectionTitle onColor" style={{ width: '100vw', marginBottom: '10px' }}>
          About Founders
        </div>

        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 22px',
            gap: '15px',
            minWidth: '200px',
            width: '29%',
            borderRadius: '18px',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-soft)',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <img
            src={sospeterPic}
            alt="Sospeter Gunga Owuor"
            className="productAvatar"
            style={{ borderRadius: '50%', width: '150px', aspectRatio: 1 / 0.95, objectFit: 'cover' }}
          />
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--brand-green)' }}>
            Sospeter Owuor
          </div>
          <div className="textAlignment">
            He holds a bachelor’s degree in Business Administration (Entrepreneurship Development) from
            Mzumbe University. He has attended several business courses from Philanthropy University. He
            co-founded Brice Agribusiness Ltd and worked as company operation director for 03 years, and
            has worked with Room to Read for five years as a Research, Monitoring and Evaluation
            Associate. He has extensive network with coffee industrial-based government institutions and
            he is much experienced with coffee exportation. He is the Managing Director of the company
          </div>
        </div>

        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 22px',
            gap: '15px',
            minWidth: '200px',
            width: '29%',
            borderRadius: '18px',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-soft)',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <img
            src={evodiusPic}
            alt="Sospeter Gunga Owuor"
            className="productAvatar"
            style={{ borderRadius: '50%', width: '150px', aspectRatio: 1 / 0.95, objectFit: 'cover' }}
          />
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--brand-green)' }}>
            Evodius Tihibika
          </div>
          <div className="textAlignment">
            He and his family have been active coffee producers for many years in the Karagwe District
            of Kagera, the country's heartland of Robusta coffee production. He has over 30 years of
            substantial experience in the coffee sector and a wide network of local coffee stakeholders.
            He is well acquainted with the product of coffee. He is Operations Director of the company
          </div>
        </div>

        <div
          className="liftCard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 22px',
            gap: '15px',
            minWidth: '200px',
            width: '29%',
            borderRadius: '18px',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-soft)',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <img
            src={omaryPic}
            alt="Sospeter Gunga Owuor"
            className="productAvatar"
            style={{ borderRadius: '50%', width: '150px', aspectRatio: 1 / 0.95, objectFit: 'cover' }}
          />
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--brand-green)' }}>
            Omary Mkandawile
          </div>
          <div className="textAlignment">
            He holds a bachelor’s degree in Business Administration (Entrepreneurship Development) from
            Mzumbe University. He has a deep coffee marketing expertise of more than 03 years’
            experience. He worked with Salute Finance for two years an assistant accountant before
            co-founding Brice Agribusiness Ltd and worked as a marketing and sales director for 03
            years. He is knowledgably with coffee products and very familiar with both local and
            international coffee clients. He handles Marketing and Sales
          </div>
        </div>
      </div>

      <div className="sectionTitle">Company Structure and Broad Members</div>
      <img
        style={{ width: '100%', borderRadius: '14px', boxShadow: 'var(--shadow-soft)' }}
        src={investorDeckPic}
        alt="TanzCoffee_Investor_Deck"
        className="deckPicAspectRation"
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '45px 0px 55px 0px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
        }}
        className="opacityAnimation"
      >
        <div className="sectionTitle onColor" style={{ width: '100vw' }}>
          Sustainability Commitment
        </div>
        <div
          style={{
            color: 'white',
            maxWidth: '700px',
            fontSize: '16px',
            width: '100vw',
            textAlign: 'center',
          }}
        >
          We use electrically powered machines and modern waste disposal facilities to minimize
          environmental impact. We are continuously exploring new ways to improve our sustainability
          efforts across our supply chain.
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
