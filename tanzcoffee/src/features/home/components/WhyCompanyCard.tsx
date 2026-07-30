interface CardProps {
  img: string;
  text: string;
}

function WhyCompanyCard({ img, text }: CardProps) {
  return (
    <div
      className="liftCard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '350px',
        width: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="homePicSlide2"
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%',
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
        }}
      >
        <img
          src={img}
          alt="slide"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        className="homeDescSlide2 slidesHeight"
        style={{
          padding: '10px',
          backgroundColor: '#dd9d6dff',
          color: 'white',
          fontSize: '16px',
          fontWeight: 400,
          borderRadius: '0 0 10px 10px',
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default WhyCompanyCard;
