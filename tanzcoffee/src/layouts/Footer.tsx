import { LuCopyright } from 'react-icons/lu';

function Footer() {
  return (
    <div
      style={{
        minHeight: '60px',
        width: '100vw',
        background: 'linear-gradient(135deg, #1d4a02 0%, #2b6603 55%, #3d8207 100%)',
        borderTop: '4px solid #dd9d6dff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '22px 15px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '18px',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <span>Copyrights </span>
        <LuCopyright style={{ fontSize: '20px' }} />
        <span>2025. </span> <span>TanzCoffee Trading Company Limited. All Rights Reserved</span>
      </div>
    </div>
  );
}

export default Footer;
