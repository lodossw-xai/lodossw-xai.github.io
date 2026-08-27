/**
 * ContactSection Component
 * Shared contact section with info, map, and form
 */
import type { ReactElement } from 'react';
import { useLocalizedData } from '../../../hooks/useLocalizedData';
import ContactForm from '../../common/ContactForm';

function ContactSection(): ReactElement {
  const data = useLocalizedData();

  return (
    <section className="bg-hero-dark text-white py-20" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Left - Header & Company Info & Map */}
          <div className="flex flex-col">
            {/* Section Header */}
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
                {data.contact.title}
              </h2>
              <p className="text-gray-400 max-w-xl whitespace-pre-line">
                {data.contact.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">
                    location_on
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {data.contact.info.address.label}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {data.contact.info.address.value}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">
                    call
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {data.contact.info.phone.label}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {data.contact.info.phone.value}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">
                    mail
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {data.contact.info.email.label}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {data.contact.info.email.value}
                  </p>
                </div>
              </div>

              {/* Map - Google Map Embed */}
              <div className="mt-8 flex-1 flex flex-col">
                <div className="bg-gray-800 rounded-2xl overflow-hidden flex-1 min-h-[350px] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.38843992964!2d127.10338097788475!3d37.40429267208111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca7c1a2dd176b%3A0xf609789d0ae4d6b0!2z6rK96riwIOyKpO2DgO2KuOyXheoeqSjqsr3quLDquIDroZzrsozqsozsnoTshLzthLAp!5e0!3m2!1sko!2skr!4v1767659706880!5m2!1sko!2skr"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="XAIKOREA Office Location"
                  ></iframe>
                  {/* Map overlay button */}
                  <a
                    href="https://maps.google.com/?q=경기도+성남시+금토로80번길+40+B동+배민스퀘어+301호"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition z-10"
                  >
                    <span className="material-symbols-outlined text-sm">
                      map
                    </span>
                    {data.contact.mapButton}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
