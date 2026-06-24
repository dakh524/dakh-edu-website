import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const GSAPCounter = ({ end, duration = 2, suffix = "" }) => {
  const counterRef = useRef(null);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const valObj = { value: 0 };
    
    const anim = gsap.to(valObj, {
      value: end,
      duration: duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        element.innerText = Math.floor(valObj.value).toLocaleString() + suffix;
      }
    });

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [end, duration, suffix]);

  return <span ref={counterRef}>0{suffix}</span>;
};

export default GSAPCounter;
