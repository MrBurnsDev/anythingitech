'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
  {
    id: 'iphone',
    overline: 'Repair & Services for',
    title: 'iPhones',
    description: "Cracked screen? Dropped in Water? Charging port not working? Check out our iPhone Repair Services and we'll make your phone good as new!",
    image: '/images/services_iphone.jpg',
    link: '/iphone-repair',
  },
  {
    id: 'mac',
    overline: 'Repair & Services for',
    title: 'Macs',
    description: 'We repair all Apple machines from MacBook Pro laptops to Mac desktops. Expert diagnostics and quality repairs you can trust.',
    image: '/images/services_mac1.jpg',
    link: '/mac-repair-services',
  },
  {
    id: 'network',
    overline: 'Services for',
    title: 'Networking',
    description: "Having problems with your router or modem? We offer complete network solutions for homes and businesses across Martha's Vineyard.",
    image: '/images/services_network.jpg',
    link: '/network-services-2',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 1000);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }, [currentSlide, goToSlide]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="hero-slider">
      <div className="hero-slider__container">
        {/* Slides */}
        <div className="hero-slider__slides">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slider__slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="hero-slider__content">
                <div className="hero-slider__text">
                  <p className="hero-slider__overline">{slide.overline}</p>
                  <h1 className="hero-slider__title">{slide.title}</h1>
                  <p className="hero-slider__description">{slide.description}</p>
                  <Link href={slide.link} className="hero-slider__btn">
                    More
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </Link>
                </div>
                <div className="hero-slider__media">
                  <Link href={slide.link}>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={560}
                      height={220}
                      className="hero-slider__image"
                      priority={index === 0}
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="hero-slider__nav">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`hero-slider__dot ${index === currentSlide ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
