import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HeroStyles = () => {
  return (
    <>
      <ToastContainer />
      <style>
        {`
          body {
            overflow-x: hidden;
            margin: 0;
          }
          .feature-text {
            color: #9F9F9F;
            transition: color 0.2s ease;
          }
          .feature-text:hover, .feature-text:active {
            color: #3D74B6 !important;
          }
          .faq-answer {
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin 0.3s ease-in-out;
          }
          .faq-answer.open {
            max-height: 500px;
            opacity: 1;
          }
          @media (max-width: 480px) {
            .feature-text-container {
              gap: 0.8rem;
            }
            .feature-text {
              flex: 1 1 calc(50% - 0.15rem);
            }
            .new-sections-container {
              flex-direction: column;
              align-items: center;
              width: 100%;
              padding: 0 clamp(0.5rem, 5vw, 1rem);
            }
            .section-container {
              width: 100%;
            }
            .section-heading, .section-subtext, .section-image {
              width: 100%;
              max-width: 100%;
              white-space: pre-wrap;
            }
            .pre-meet-clario-text {
              width: 100%;
              max-width: 100%;
              white-space: pre-wrap;
            }
            .phone-images-container {
              flex-direction: column;
              gap: clamp(1rem, 3vw, 2rem);
              align-items: center;
            }
            .phone-images-container img {
              width: clamp(280px, 90vw, 340px);
              height: clamp(498px, 160vw, 582px);
              max-width: 100%;
              flex-shrink: 0;
              aspect-ratio: 31/63;
              object-fit: contain;
            }
            .think-smarter-container {
              width: 100vw;
              height: clamp(300px, 50vw, 400px);
              border-radius: 0;
              margin: 4rem 0 0;
              padding: clamp(1rem, 5vw, 2rem);
              left: 0;
              right: 0;
              box-sizing: border-box;
            }
            .think-smarter-text-first {
              font-size: clamp(24px, 6vw, 32px);
              letter-spacing: -1.28px;
              white-space: nowrap;
            }
            .think-smarter-text-rest {
              font-size: clamp(24px, 6vw, 32px);
              letter-spacing: -1.28px;
              white-space: nowrap;
            }
            .new-container {
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
              height: clamp(280px, 75vw, 380px);
              border-radius: clamp(12px, 3vw, 16px);
              background: #E2EFFF;
              margin: clamp(1.5rem, 4vw, 2rem) auto 0;
              padding: clamp(1rem, 2.5vw, 1.5rem);
              box-sizing: border-box;
            }
            .new-text-container {
              width: 100%;
              max-width: clamp(260px, 80vw, 340px);
              height: auto;
              margin: clamp(0.5rem, 2vw, 1rem) auto 0;
              padding: 0 clamp(0.25rem, 1vw, 0.5rem);
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .new-text-clario {
              font-size: clamp(12px, 3vw, 16px);
              letter-spacing: -0.5px;
              line-height: 1.4;
              white-space: nowrap;
              margin: 0;
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .new-text-rest {
              font-size: clamp(12px, 3vw, 16px);
              letter-spacing: -0.5px;
              line-height: 1.4;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: break-word;
              margin: clamp(0.2rem, 0.8vw, 0.4rem) 0 0 0;
            }
            .new-subtext {
              width: 100%;
              max-width: clamp(240px, 75vw, 320px);
              font-size: clamp(6px, 1.5vw, 8px);
              line-height: 1.6;
              margin: clamp(0.5rem, 1.5vw, 1rem) auto 0;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: break-word;
              text-align: center;
            }
            .new-image {
              width: clamp(280px, 90vw, 340px);
              height: clamp(230px, 74.36vw, 280px);
              max-width: 100%;
              flex-shrink: 0;
              aspect-ratio: 490/321;
              object-fit: contain;
              margin: clamp(1rem, 3vw, 2rem) auto 0;
              display: block;
            }
            .insight-text {
              font-size: clamp(20px, 5vw, 24px);
            }
            .connect-dots-text {
              font-size: clamp(36px, 10vw, 48px);
              width: 100%;
              letter-spacing: -1.92px;
            }
            .learn-patterns-text {
              font-size: clamp(16px, 4vw, 20px);
              width: 100%;
            }
            .coming-soon-button {
              width: clamp(180px, 50vw, 220px);
              height: clamp(40px, 10vw, 48px);
              padding: clamp(8px, 2vw, 10px) clamp(20px, 5vw, 24px);
              border-radius: 40px;
            }
            .coming-soon-button span {
              font-size: clamp(16px, 4vw, 20px);
            }
            .chat-clario-container {
              margin-top: clamp(1rem, 3vw, 2rem);
              flex-direction: column;
              align-items: flex-start;
            }
            .chat-clario-text {
              font-size: clamp(16px, 3vw, 18px);
            }
            .vo1-beta-button {
              height: clamp(32px, 5vw, 36px);
              padding: clamp(8px, 2vw, 10px) clamp(20px, 5vw, 24px);
              border-radius: clamp(20px, 5vw, 40px);
            }
            .vo1-beta-button span {
              font-size: clamp(16px, 3vw, 18px);
            }
            .faq-heading {
              font-size: clamp(24px, 6vw, 32px);
              -webkit-text-stroke-width: 0.5px;
            }
            .faq-container {
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
              height: clamp(60px, 15vw, 80px);
              border-radius: clamp(10px, 2vw, 12px);
              margin: clamp(1rem, 2vw, 1.5rem) auto 0;
            }
            .faq-question {
              font-size: clamp(16px, 4vw, 20px);
              -webkit-text-stroke-width: 0.5px;
            }
            .faq-answer {
              font-size: clamp(12px, 3vw, 16px);
              margin: 0.5rem auto 0;
              max-width: clamp(300px, 90vw, 400px);
            }
            .personal-intelligence-text {
              font-size: clamp(24px, 8vw, 36px);
              letter-spacing: -1.44px;
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
            }
            .chat-clario-footer-container {
              flex-direction: column;
              align-items: flex-start;
              gap: clamp(0.5rem, 2vw, 1rem);
            }
            .footer-logo-container {
              flex-direction: column;
              align-items: center;
              gap: clamp(0.5rem, 2vw, 1rem);
            }
            .footer-links-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: clamp(1rem, 3vw, 2rem);
              justify-items: start;
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
              margin: clamp(1rem, 3vw, 2rem) auto 0;
            }
            .footer-links-column {
              display: flex;
              flex-direction: column;
              gap: clamp(0.25rem, 0.75vw, 0.5rem);
            }
            .question-container {
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
              height: auto;
              min-height: clamp(150px, 40vw, 200px);
              transform: rotate(-0.363deg);
              border-radius: clamp(12px, 3vw, 16px);
              border: 1px solid #FFF;
              background: rgba(255, 255, 255, 0.01);
              box-shadow: 0 4px 10px 8px #FFF inset, 0 4px 20px 0 rgba(0, 0, 0, 0.02) inset, 0 4px 20px 0 rgba(0, 0, 0, 0.05) inset, 0 4px 22px 9px rgba(61, 116, 182, 0.25);
              backdrop-filter: blur(10px);
              margin: 0 auto;
              padding: clamp(1rem, 2.5vw, 1.5rem);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .question-wrapper {
              position: relative;
              display: flex;
              align-items: flex-start;
              width: 100%;
              max-width: clamp(300px, 90vw, 400px);
              margin: clamp(0rem, 3vw, 3rem) auto 0;
            }
            .question-icon-right {
              position: absolute;
              top: 50%;
              left: calc(100% + -1rem);
              transform: translateY(calc(-50% - 5rem));
              width: 84px;
              height: 84px;
              flex-shrink: 0;
            }
            .question-text-container {
              display: flex;
              align-items: center;
              gap: clamp(0.5rem, 1.5vw, 1rem);
              width: 100%;
            }
            .question-text {
              font-size: clamp(14px, 3.5vw, 16px);
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .answer-text {
              font-size: clamp(14px, 3.5vw, 16px);
              width: 100%;
              max-width: clamp(260px, 80vw, 340px);
              word-break: break-word;
              overflow-wrap: break-word;
              
            }
            .suggestion-text-container {
              font-size: clamp(14px, 3.5vw, 16px);
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .gradient-background {
              position: absolute;
              top: 0;
              left: 0;
              width: 100vw;
              height: clamp(600px, 180vw, 700px);
              flex-shrink: 0;
              background: linear-gradient(287deg, #D0E5FF 4.24%, #FFF 98.16%);
              filter: blur(50px);
              z-index: -1;
            }
            .normal-background {
              background: #FFF;
            }
            .feature-section-p {
              width: 100%;
              margin: 0 auto;
              text-align: center;
            }
            .feature-text-container {
              width: 100%;
              margin: 0 auto;
              justify-content: center;
            }
            .image-container {
              justify-content: center;
            }
            .image-container img {
              width: 100%;
              height: auto;
              max-height: 100vh;
            }
          }
          @media (min-width: 481px) {
            .logo-container {
              margin-left: clamp(2rem, 4vw, 4rem);
            }
            .button-container {
              margin-right: clamp(2rem, 4vw, 4rem);
            }
            .feature-text-container {
              gap: clamp(0.2rem, 1vw, 0.5rem);
              width: min(100%, 861.382px);
              justify-content: flex-start;
              margin-left: 0;
              margin-right: auto;
            }
            .feature-section-p {
              width: min(100%, 861.382px);
              text-align: left;
              margin-left: 0;
              margin-right: auto;
            }
            .image-container {
              justify-content: flex-start;
              margin-left: 0;
              margin-right: auto;
            }
            .image-container img {
              width: min(100%, 1314px);
              height: auto;
              max-height: 100vh;
            }
            .feature-text {
              flex: 1 1 auto;
            }
            .new-sections-container {
              flex-direction: row;
              flex-wrap: nowrap;
              justify-content: space-between;
              align-items: flex-start;
              width: min(90%, 1150px);
              margin: 10rem auto;
              gap: clamp(2.5rem, 3vw, 3.75rem);
            }
            .section-container {
              width: min(45%, 540px);
            }
            .section-container:nth-child(2) {
              margin-left: clamp(1.25rem, 1.5vw, 1.875rem);
            }
            .section-heading {
              width: min(100%, 540px);
            }
            .section-subtext, .section-image {
              width: min(100%, 516px);
            }
            .pre-meet-clario-text {
              width: min(100%, 1221px);
              max-width: 100%;
            }
            .phone-images-container {
              flex-direction: row;
              flex-wrap: nowrap;
              gap: clamp(3rem, 6vw, 6rem);
              justify-content: center;
            }
            .phone-images-container img {
              width: 376px;
              height: 664px;
              flex-shrink: 0;
              aspect-ratio: 31/63;
              object-fit: contain;
            }
            .think-smarter-container {
              width: 100vw;
              height: clamp(400px, 50vw, 600px);
              border-radius: 0;
              margin: 4rem 0 0;
              padding: clamp(1rem, 5vw, 2rem);
              left: 0;
              right: 0;
              box-sizing: border-box;
            }
            .think-smarter-text-first {
              font-size: clamp(32px, 6vw, 76px);
              letter-spacing: clamp(-1.28px, -0.3vw, -3.84px);
              white-space: nowrap;
            }
            .think-smarter-text-rest {
              font-size: clamp(32px, 6vw, 76px);
              letter-spacing: clamp(-1.28px, -0.3vw, -3.84px);
              white-space: nowrap;
            }
            .new-container {
              width: calc(100% - 3rem);
              height: clamp(400px, 50vw, 750px);
              border-radius: clamp(30px, 5vw, 50px);
              background: #E2EFFF;
              margin: clamp(2rem, 5vw, 4rem) auto 0;
              padding: clamp(1rem, 2.5vw, 2rem);
            }
            .new-text-container {
              width: min(100%, clamp(400px, 50vw, 637px));
              height: clamp(100px, 25vw, 172px);
              margin: clamp(1rem, 3vw, 2rem) 0 0 clamp(1rem, 3vw, 2rem);
            }
            .new-text-clario {
              font-size: clamp(36px, 8vw, 68px);
              letter-spacing: clamp(-1.44px, -0.3vw, -2.72px);
              white-space: nowrap;
            }
            .new-text-rest {
              font-size: clamp(36px, 8vw, 68px);
              letter-spacing: clamp(-1.44px, -0.3vw, -2.72px);
              white-space: normal;
            }
            .subtext-container {
              position: relative;
              z-index: 1;
            }
            .subtext-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50px;
              border: 1px solid #9F9F9F;
              opacity: 0.4;
              background: #E2EFFF;
              filter: blur(5px);
              z-index: -1;
            }
            .new-subtext {
              width: min(100%, clamp(350px, 50vw, 556px));
              font-size: clamp(16px, 3vw, 24px);
              margin: clamp(1rem, 3vw, 2rem) 0 0 0;
            }
            .new-image {
              width: 780px;
              height: 642px;
              flex-shrink: 0;
              aspect-ratio: 490/321;
              object-fit: contain;
              margin: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 0 0;
              align-self: flex-start;
            }
            .insight-text {
              font-size: clamp(24px, 4vw, 28px);
            }
            .connect-dots-text {
              font-size: clamp(48px, 8vw, 96px);
              width: min(100%, 959px);
              letter-spacing: clamp(-1.92px, -0.4vw, -3.84px);
            }
            .learn-patterns-text {
              font-size: clamp(20px, 3vw, 24px);
              width: min(100%, 820px);
            }
            .coming-soon-button {
              width: 260px;
              height: 60px;
              padding: 12px 32px;
              border-radius: 50px;
            }
            .coming-soon-button span {
              font-size: 24px;
            }
            .chat-clario-container {
              margin-top: clamp(1rem, 3vw, 2rem);
            }
            .chat-clario-text {
              font-size: clamp(18px, 3vw, 22px);
            }
            .vo1-beta-button {
              height: clamp(32px, 5vw, 40px);
              padding: clamp(8px, 2vw, 12px) clamp(20px, 5vw, 32px);
              border-radius: clamp(30px, 5vw, 50px);
            }
            .vo1-beta-button span {
              font-size: clamp(18px, 3vw, 22px);
            }
            .faq-heading {
              font-size: clamp(32px, 6vw, 52px);
              -webkit-text-stroke-width: 1px;
            }
            .faq-container {
              width: min(100%, clamp(600px, 80vw, 967px));
              height: clamp(60px, 10vw, 80px);
              border-radius: clamp(12px, 2vw, 15px);
              margin: clamp(1.5rem, 3vw, 2rem) auto 0;
            }
            .faq-question {
              font-size: clamp(18px, 3vw, 24px);
              -webkit-text-stroke-width: 1px;
            }
            .faq-answer {
              font-size: clamp(14px, 2.5vw, 20px);
              margin: 0.5rem auto 0;
              max-width: clamp(600px, 80vw, 967px);
            }
            .personal-intelligence-text {
              font-size: clamp(36px, 8vw, 72px);
              letter-spacing: clamp(-1.44px, -0.3vw, -2.88px);
              width: min(100%, clamp(400px, 80vw, 777px));
            }
            .chat-clario-footer-container {
              flex-direction: column;
              align-items: flex-start;
              gap: clamp(0.5rem, 1.5vw, 1rem);
              margin-left: clamp(-4rem, -5vw, -5rem);
            }
            .footer-logo-container {
              flex-direction: row;
              align-items: center;
              gap: clamp(0.5rem, 1.5vw, 1rem);
            }
            .footer-links-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: clamp(1.5rem, 3vw, 2rem);
              justify-items: start;
              width: auto;
              margin: 0;
            }
            .footer-links-column {
              display: flex;
              flex-direction: column;
              gap: clamp(0.25rem, 0.75vw, 0.5rem);
            }
            .question-container {
              width: min(100%, clamp(500px, 80vw, 661.668px));
              height: auto;
              min-height: clamp(200px, 30vw, 233.005px);
              transform: rotate(-0.363deg);
              border-radius: clamp(20px, 4vw, 25px);
              border: 1px solid #FFF;
              background: rgba(255, 255, 255, 0.01);
              box-shadow: 0 4px 10px 8px #FFF inset, 0 4px 20px 0 rgba(0, 0, 0, 0.02) inset, 0 4px 20px 0 rgba(0, 0, 0, 0.05) inset, 0 4px 22px 9px rgba(61, 116, 182, 0.25);
              backdrop-filter: blur(10px);
              margin: 0 auto;
              padding: clamp(1.5rem, 3vw, 2rem);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .question-wrapper {
              position: relative;
              display: flex;
              align-items: flex-start;
              width: min(100%, clamp(500px, 80vw, 661.668px));
              margin: clamp(2rem, 6vw, 3rem) auto 0;
            }
            .question-icon-right {
              position: absolute;
              top: 50%;
              left: calc(100% + -1rem);
              transform: translateY(calc(-50% - 5rem));
              width: 84px;
              height: 84px;
              flex-shrink: 0;
            }
            .question-text-container {
              display: flex;
              align-items: center;
              gap: clamp(0.75rem, 2vw, 1.25rem);
              width: 100%;
            }
            .question-text {
              font-size: clamp(16px, 3vw, 20px);
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .answer-text {
              font-size: clamp(16px, 3vw, 20px);
              width: min(100%, clamp(400px, 75vw, 518px));
              word-break: break-word;
              overflow-wrap: break-word;
              
            }
            .suggestion-text-container {
              font-size: clamp(16px, 3vw, 20px);
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .gradient-background {
              position: absolute;
              top: 0;
              left: 0;
              width: 100vw;
              height: 1045px;
              flex-shrink: 0;
              background: linear-gradient(287deg, #D0E5FF 4.24%, #FFF 98.16%);
              filter: blur(50px);
              z-index: -1;
            }
            .normal-background {
              background: #FFF;
            }
          }
          @media (min-width: 1025px) {
            .logo-container {
              margin-left: clamp(2rem, 4vw, 4rem);
            }
            .button-container {
              margin-right: clamp(2rem, 4vw, 4rem);
            }
            .feature-text-container {
              gap: clamp(0.2rem, 1vw, 0.5rem);
              width: min(100%, 861.382px);
              justify-content: flex-start;
              margin-left: 0;
              margin-right: auto;
            }
            .feature-section-p {
              width: min(100%, 861.382px);
              text-align: left;
              margin-left: 0;
              margin-right: auto;
            }
            .image-container {
              justify-content: flex-start;
              margin-left: 0;
              margin-right: auto;
            }
            .image-container img {
              width: min(100%, 1314px);
              height: auto;
              max-height: 100vh;
            }
            .feature-text {
              flex: 1 1 auto;
            }
            .phone-images-container {
              flex-direction: row;
              flex-wrap: nowrap;
              gap: clamp(3rem, 6vw, 6rem);
              justify-content: center;
            }
            .phone-images-container img {
              width: 376px;
              height: 664px;
              flex-shrink: 0;
              aspect-ratio: 31/63;
              object-fit: contain;
            }
            .think-smarter-container {
              width: 100vw;
              height: clamp(400px, 50vw, 600px);
              border-radius: 0;
              margin: 4rem 0 0;
              padding: clamp(1rem, 5vw, 2rem);
              left: 0;
              right: 0;
              box-sizing: border-box;
            }
            .think-smarter-texts {
              margin-left: 14rem;
              margin-right: 2rem;
            }
            .think-smarter-text-first {
              font-size: clamp(32px, 6vw, 76px);
              letter-spacing: clamp(-1.28px, -0.3vw, -3.84px);
              white-space: nowrap;
            }
            .think-smarter-text-rest {
              font-size: clamp(32px, 6vw, 76px);
              letter-spacing: clamp(-1.28px, -0.3vw, -3.84px);
              white-space: nowrap;
            }
            .new-container {
              width: calc(100% - 3rem);
              height: 750px;
              border-radius: 50px;
              background: #E2EFFF;
              margin: clamp(2rem, 5vw, 4rem) auto 0;
              padding: clamp(1rem, 2.5vw, 2rem);
            }
            .new-text-container {
              width: 637px;
              height: 172px;
              margin: 2rem 0 0 2rem;
            }
            .new-text-clario {
              font-size: 68px;
              letter-spacing: -2.72px;
              white-space: nowrap;
            }
            .new-text-rest {
              font-size: 68px;
              letter-spacing: -2.72px;
              white-space: normal;
            }
            .subtext-container {
              position: relative;
              z-index: 1;
            }
            .subtext-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50px;
              border: 1px solid #9F9F9F;
              opacity: 0.4;
              background: #E2EFFF;
              filter: blur(5px);
              z-index: -1;
            }
            .new-subtext {
              width: 556px;
              font-size: 24px;
              margin: 2rem 0 0 0;
            }
            .new-image {
              width: 780px;
              height: 642px;
              flex-shrink: 0;
              aspect-ratio: 490/321;
              object-fit: contain;
              margin: 2rem 2rem 0 0;
              align-self: flex-start;
            }
            .insight-text {
              font-size: 28px;
            }
            .connect-dots-text {
              font-size: 96px;
              width: 959px;
              letter-spacing: -3.84px;
            }
            .learn-patterns-text {
              font-size: 24px;
              width: 820px;
            }
            .coming-soon-button {
              width: 260px;
              height: 60px;
              padding: 12px 32px;
              border-radius: 50px;
            }
            .coming-soon-button span {
              font-size: 24px;
            }
            .chat-clario-container {
              margin-top: 2rem;
            }
            .chat-clario-text {
              font-size: 22px;
            }
            .vo1-beta-button {
              height: 40px;
              padding: 12px 32px;
              border-radius: 50px;
            }
            .vo1-beta-button span {
              font-size: 22px;
            }
            .faq-heading {
              font-size: 52px;
              -webkit-text-stroke-width: 1px;
            }
            .faq-container {
              width: min(100%, 967px);
              height: 80px;
              border-radius: 15px;
              margin: clamp(1.5rem, 3vw, 2rem) auto 0;
            }
            .faq-question {
              font-size: 24px;
              -webkit-text-stroke-width: 1px;
            }
            .faq-answer {
              font-size: 20px;
              margin: 0.5rem auto 0;
              max-width: 967px;
            }
            .personal-intelligence-text {
              font-size: 72px;
              letter-spacing: -2.88px;
              width: min(100%, 777px);
            }
            .chat-clario-footer-container {
              flex-direction: column;
              align-items: flex-start;
              gap: clamp(0.5rem, 1.5vw, 1rem);
              margin-left: clamp(-4rem, -5vw, -5rem);
            }
            .footer-logo-container {
              flex-direction: row;
              align-items: center;
              gap: clamp(0.5rem, 1.5vw, 1rem);
            }
            .footer-links-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: clamp(1.5rem, 3vw, 2rem);
              justify-items: start;
              width: auto;
              margin: 0;
            }
            .footer-links-column {
              display: flex;
              flex-direction: column;
              gap: clamp(0.25rem, 0.75vw, 0.5rem);
            }
            .question-container {
              width: min(100%, 661.668px);
              height: auto;
              min-height: clamp(200px, 30vw, 233.005px);
              transform: rotate(-0.363deg);
              border-radius: 25px;
              border: 1px solid #FFF;
              background: rgba(255, 255, 255, 0.01);
              box-shadow: 0 4px 10px 8px #FFF inset, 0 4px 20px 0 rgba(0, 0, 0, 0.02) inset, 0 4px 20px 0 rgba(0, 0, 0, 0.05) inset, 0 4px 22px 9px rgba(61, 116, 182, 0.25);
              backdrop-filter: blur(10px);
              margin: 0 auto;
              padding: clamp(1.5rem, 3vw, 2rem);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .question-wrapper {
              position: relative;
              display: flex;
              align-items: flex-start;
              width: min(100%, 661.668px);
              margin: clamp(2rem, 6vw, 3rem) auto 0;
            }
            .question-icon-right {
              position: absolute;
              top: 50%;
              left: calc(100% + 1rem);
              transform: translateY(calc(-50% - 5rem));
              width: 94px;
              height: 94px;
              flex-shrink: 0;
            }
            .question-text-container {
              display: flex;
              align-items: center;
              gap: clamp(0.75rem, 2vw, 1.25rem);
              width: 100%;
            }
            .question-text {
              font-size: 20px;
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .answer-text {
              font-size: 20px;
              width: min(100%, 518px);
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .suggestion-text-container {
              font-size: 20px;
              word-break: break-word;
              overflow-wrap: break-word;
            }
            .gradient-background {
              position: absolute;
              top: 0;
              left: 0;
              width: 100vw;
              height: 1045px;
              flex-shrink: 0;
              background: linear-gradient(287deg, #D0E5FF 4.24%, #FFF 98.16%);
              filter: blur(50px);
              z-index: -1;
            }
            .normal-background {
              background: #FFF;
            }
          }
        `}
      </style>
    </>
  );
};

export default HeroStyles;