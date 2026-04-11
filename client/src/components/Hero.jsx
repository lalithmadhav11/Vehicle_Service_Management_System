import React from 'react';
import carRepairImg from '../assets/car_repair.png';

const Hero = ({ onOpenAuth }) => {
  return (
    <>
      <style>
        {`
          .hero-container {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg, #000);
            position: relative;
            overflow: hidden;
            padding-top: 8vh;
            align-items: center;
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
          }
          .hero-image-container {
            flex: 1;
            position: relative;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            mask-image: linear-gradient(to right, transparent 0%, black 25%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 25%);
          }
          
          .hero-gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.6) 20%, transparent 100%);
            z-index: 5;
            pointer-events: none;
          }

          .hero-subtitle {
            color: #fff;
            letter-spacing: 2px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
            text-transform: uppercase;
            font-weight: 600;
          }

          .hero-title {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: clamp(2.2rem, 3.8vw, 4rem);
            line-height: 1.15;
            margin-bottom: 25px;
            color: #ffffff;
            letter-spacing: -1px;
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }

          .hero-title span {
            display: block;
          }
          
          .hero-title .highlight {
            color: var(--primary, #CC0000);
            text-shadow: 0 0 20px var(--primary-glow, rgba(204, 0, 0, 0.4));
          }

          .hero-actions {
            display: flex;
            gap: 20px;
            align-items: center;
            margin-top: 10px;
          }

          .btn-primary {
            background: var(--primary, #CC0000);
            color: #fff;
            border: none;
            padding: 16px 45px;
            font-size: 1.1rem;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(204, 0, 0, 0.3);
            border-radius: 50px;
          }

          .btn-primary:hover {
            background: #e60000;
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(204, 0, 0, 0.5);
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 15px 30px;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 3px;
            backdrop-filter: blur(10px);
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }

          @media (max-width: 992px) {
            .hero-container {
              flex-direction: column;
              padding-top: 12vh;
              text-align: center;
            }
            
            .hero-content {
              padding: 0 5%;
              align-items: center;
              margin-bottom: 20px;
            }

            .hero-subtitle {
              justify-content: center;
            }

            .hero-image-container {
              width: 100%;
              height: 50vh;
            }

            .hero-image {
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
            <button className="btn-primary" onClick={() => onOpenAuth('register')}>
              Get Started
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

