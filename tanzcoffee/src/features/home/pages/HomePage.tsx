import { useEffect, useState } from 'react';
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';
import HeroSlideShow from '../components/HeroSlideShow';
import CardSlideShow from '../components/CardSlideShow';
import WhyCompanyCard from '../components/WhyCompanyCard';
import OperationCard from '../components/OperationCard';
import pic1 from '../../../assets/pic1.webp';
import pic2 from '../../../assets/pic2.webp';
import pic3 from '../../../assets/pic3.webp';
import pic4 from '../../../assets/pic4.webp';
import pic5 from '../../../assets/pic5.webp';
import pic6 from '../../../assets/pic6.webp';
import slide2Pic1 from '../../../assets/Slide2pic1NewCroped.webp';
import slide2Pic2 from '../../../assets/Slide2pic2.webp';
import slide2Pic3 from '../../../assets/Slide2pic3.webp';
import slide2Pic4 from '../../../assets/Slide2pic4.webp';
import slide2Pic5 from '../../../assets/Slide2pic5New.webp';
import slide2Pic6 from '../../../assets/Slide2pic6.webp';

function HomeSections() {
  const whyCompanySlides = [
    <WhyCompanyCard
      key="c1"
      img={pic1}
      text="Reduction of broken coffee and high retention rate through the use of highly developed, high-capacity processing machines"
    />,
    <WhyCompanyCard
      key="c2"
      img={pic2}
      text="A well-organized firm administrative structure that ensures exceptional customer service"
    />,
    <WhyCompanyCard key="c3" img={pic3} text="Proper facilities and product handling for quality" />,
    <WhyCompanyCard
      key="c4"
      img={pic4}
      text="Maintaining professional services through hiring skilled and experienced staff."
    />,
    <WhyCompanyCard
      key="c5"
      img={pic5}
      text="Product quality is ensured by professional quality team and advanced production facilities"
    />,
    <WhyCompanyCard
      key="c6"
      img={pic6}
      text="The company accepts all secured legal payment terms for international clients such as Letter of Credit and Cash Against Documents."
    />,
  ];

  const operationSlides = [
    <OperationCard key="d1" img={slide2Pic6} text="We buy fresh Tanzanian coffee cherries every season" />,
    <OperationCard
      key="d2"
      img={slide2Pic1}
      text="We process the products in our own facilities for quality"
    />,
    <OperationCard
      key="d3"
      img={slide2Pic3}
      text="Our coffee products are less broken with high retention due to use of advanced machines"
    />,
    <OperationCard key="d4" img={slide2Pic2} text="Q-grader ensures our product quality before delivery" />,
    <OperationCard
      key="d5"
      img={pic3}
      text="The products are then packed in Standard food grade jute-bags for quality"
    />,
    <OperationCard
      key="d6"
      img={slide2Pic5}
      text="High-quality storage during transport ensures product safety"
    />,
    <OperationCard
      key="d7"
      img={slide2Pic4}
      text="We export products on basis of FOB or CIF depending on established agreements "
    />,
  ];

  const [whyIndex, setWhyIndex] = useState(0);
  const [whyAnimate, setWhyAnimate] = useState(true);
  const [operateIndex, setOperateIndex] = useState(0);
  const [operateAnimate, setOperateAnimate] = useState(true);

  const nextWhy = () => {
    setWhyAnimate(false);
    setTimeout(() => {
      setWhyIndex((prev) => (prev + 1) % whyCompanySlides.length);
      setWhyAnimate(true);
    }, 20);
  };

  const previousWhy = () => {
    setWhyAnimate(false);
    setTimeout(() => {
      setWhyIndex((prev) => (prev - 1 + whyCompanySlides.length) % whyCompanySlides.length);
      setWhyAnimate(true);
    }, 20);
  };

  const nextOperate = () => {
    setOperateAnimate(false);
    setTimeout(() => {
      setOperateIndex((prev) => (prev + 1) % operationSlides.length);
      setOperateAnimate(true);
    }, 20);
  };

  const previousOperate = () => {
    setOperateAnimate(false);
    setTimeout(() => {
      setOperateIndex((prev) => (prev - 1 + operationSlides.length) % operationSlides.length);
      setOperateAnimate(true);
    }, 20);
  };

  useEffect(() => {
    const timer = setInterval(() => nextWhy(), 7000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => nextOperate(), 7000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '130px 0px 70px 0px',
          gap: '20px',
        }}
      >
        <div className="sectionTitle">Overview</div>
        <div
          style={{
            color: 'rgba(185, 130, 12, 1)',
            width: '85vw',
            maxWidth: '700px',
            fontSize: '18px',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Founded in 2024 and registered under the registration number 177486825, TanzCoffee Trading
          Company Limited is a private limited company with its headquarters in Tanzania.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          borderRadius: '5px',
          padding: '40px 30px 60px 30px',
          background: 'linear-gradient(160deg, #dd9d6dff 0%, #c9834f 100%)',
          gap: '10px',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <div className="sectionTitle onColor" style={{ width: '100%' }}>
          How We Operate
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: '85vw',
            fontSize: '18px',
            paddingBottom: '30px',
            color: 'white',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          The company supplies both Arabica and Robusta coffee products. Our factory processes premium
          Robusta green coffee products to suit international market requirements while simultaneously
          providing a ready market for the increasing coffee production in Tanzania.
        </div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: '10px',
          }}
        >
          <div
            className="navArrow"
            style={{
              borderRadius: '50%',
              padding: '10px 13px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            onClick={previousOperate}
          >
            <CgChevronLeft style={{ fontSize: '25px', color: '#dd9d6dff' }} />
          </div>
          <div style={{ maxWidth: '350px' }}>
            <CardSlideShow
              index={operateIndex}
              slides={operationSlides}
              animeClass={operateAnimate ? 'slideLeft' : ''}
            />
          </div>
          <div
            className="navArrow"
            style={{
              borderRadius: '50%',
              padding: '10px 13px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            onClick={nextOperate}
          >
            <CgChevronRight style={{ fontSize: '25px', color: '#dd9d6dff' }} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          borderRadius: '5px',
          padding: '15px 15px 60px 15px',
          backgroundColor: 'white',
          gap: '15px',
          width: '100%',
        }}
      >
        <div className="sectionTitle" style={{ width: '100%', marginBottom: '20px' }}>
          Why Our Company
        </div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: '10px',
          }}
        >
          <div
            className="navArrow"
            style={{
              borderRadius: '50%',
              padding: '10px 13px',
              background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
              cursor: 'pointer',
            }}
            onClick={previousWhy}
          >
            <CgChevronLeft style={{ fontSize: '25px', color: 'white' }} />
          </div>
          <div style={{ maxWidth: '350px' }}>
            <CardSlideShow
              index={whyIndex}
              slides={whyCompanySlides}
              animeClass={whyAnimate ? 'slideRight' : ''}
            />
          </div>
          <div
            className="navArrow"
            style={{
              borderRadius: '50%',
              padding: '10px 13px',
              background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
              cursor: 'pointer',
            }}
            onClick={nextWhy}
          >
            <CgChevronRight style={{ fontSize: '25px', color: 'white' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <HeroSlideShow />
      <HomeSections />
    </div>
  );
}

export default HomePage;
