import React from 'react';
import carRepairImg from '../assets/car_repair.png';

const Hero = ({ onOpenAuth }) => {
  return (
    <>
      <style>
        {`
          .hero-container {
            display: flex;
            min-height: calc(100vh - 70px);
            background-color: var(--bg, #000);
            position: relative;
            align-items: center;
            padding: 40px 0;
          }
          .hero-content {
            flex: 1;
            padding: 0 5% 0 4%;
            z-index: 10;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            text-align: left;
            animation: stagger-in 0.8s ease-out both;
          }
          .hero-image-container {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-right: 4%;
            animation: fade-in 1s ease-out 0.2s both;
          }
          .hero-image {
            width: 100%;
            height: auto;
            max-height: 80vh;
            object-fit: contain;
            filter: drop-shadow(0 0 30px rgba(204, 0, 0, 0.2));
            mask-image: linear-gradient(to right, transparent 0%, black 15%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%);
          }
          
          .hero-gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.3) 30%, transparent 100%);
            z-index: 5;
            pointer-events: none;
          }

          .hero-subtitle {
            color: #fff;
            letter-spacing: 2px;
            margin-bottom: 24px;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 12px;
            text-transform: uppercase;
            font-weight: 600;
          }

          .hero-title {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: clamp(2.5rem, 4.5vw, 4.5rem);
            line-height: 1.1;
            margin-bottom: 30px;
            color: #ffffff;
            letter-spacing: -1.5px;
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }

          .hero-title span {
            display: block;
          }
          
          .hero-title .highlight {
            color: var(--primary);
            text-shadow: 0 0 25px var(--primary-glow);
            margin-top: 5px;
          }

          .hero-actions {
            display: flex;
            gap: 20px;
            align-items: center;
            margin-top: 15px;
          }

          @media (max-width: 992px) {
            .hero-container {
              flex-direction: column;
              text-align: center;
              padding: 60px 0 20px 0;
            }
            
            .hero-content {
              padding: 0 5%;
              align-items: center;
              margin-bottom: 40px;
            }

            .hero-subtitle {
              justify-content: center;
            }

            .hero-title {
               font-size: clamp(2.2rem, 8vw, 3rem);
            }

            .hero-image-container {
              width: 100%;
              padding: 0;
            }

            .hero-image {
              max-height: 50vh;
              mask-image: linear-gradient(to top, black 70%, transparent 100%);
              -webkit-mask-image: linear-gradient(to top, black 70%, transparent 100%);
            }

            .hero-gradient-overlay {
              background: linear-gradient(180deg, #000 0%, transparent 50%, #000 100%);
            }
          }
        `}
      </style>

      <section className="hero-container">
        {/* LEFT SIDE - CONTENT */}
        <div className="hero-content">
          <div className="hero-subtitle">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></span>
            Premium Automobile Detailing
          </div>
          
          <h1 className="hero-title">
            <span>One Stop Solution For</span>
            <span>Car Maintenance</span>
            <span className="highlight">Repair & Detailing</span>
          </h1>
          
          <div className="hero-actions">
            <button className="angled-button" onClick={() => onOpenAuth('register')} style={{ fontSize: '1.05rem', padding: '16px 45px' }}>
              Get Started
            </button>
            <button className="ghost-button" onClick={() => onOpenAuth('login')} style={{ fontSize: '1.05rem', padding: '15px 40px' }}>
              Sign In
            </button>
          </div>
        </div>
        
        {/* RIGHT SIDE - FLOATING REPAIR GRAPHIC */}
        <div className="hero-image-container">
          <div className="hero-gradient-overlay"></div>
          <img 
            src={carRepairImg} 
            alt="Car Repair and Servicing" 
            className="hero-image"
          />
        </div>
      </section>
    </>
  );
};

export default Hero;

