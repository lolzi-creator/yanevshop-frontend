import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 md:pt-40 lg:pt-44 pb-6 md:pb-8 lg:pb-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4 tracking-tight text-slate-900">
              Über Yanev Shop
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light">
              Ihr vertrauensvoller Partner für alpine Abenteuer
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-6 md:py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-12 items-center">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 md:mb-4 tracking-tight text-slate-900">
                  Unsere Geschichte
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light leading-relaxed mb-3 md:mb-4">
                  Yanev Shop wurde mit der Leidenschaft für Skifahren und dem Engagement für höchste Qualität gegründet. 
                  Wir sind ein Familienunternehmen, das sich auf Premium Ski-Ausrüstung spezialisiert hat.
                </p>
                <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light leading-relaxed">
                  Unser Gründer, ein erfahrener Skifahrer, versteht die Bedeutung der richtigen Ausrüstung. 
                  Jedes Produkt wird sorgfältig ausgewählt und getestet, um unseren hohen Standards zu entsprechen.
                </p>
              </div>
              <div className="bg-slate-100 rounded-xl md:rounded-2xl aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"
                  alt="Ski Shop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-6 md:py-8 lg:py-12 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 md:mb-6 lg:mb-8 text-center tracking-tight text-slate-900">
              Was uns auszeichnet
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">Premium Qualität</h3>
                <p className="text-xs md:text-sm text-slate-600 font-light">
                  Nur die besten Marken und neueste Technologie
                </p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">Experten-Beratung</h3>
                <p className="text-xs md:text-sm text-slate-600 font-light">
                  Unser Team hilft Ihnen, die perfekte Ausrüstung zu finden
                </p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">Qualitätsgarantie</h3>
                <p className="text-xs md:text-sm text-slate-600 font-light">
                  Jedes Produkt wird sorgfältig geprüft
                </p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1 md:mb-2">Kundensupport</h3>
                <p className="text-xs md:text-sm text-slate-600 font-light">
                  Wir sind vor, während und nach dem Kauf für Sie da
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-6 md:py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 md:mb-6 tracking-tight text-slate-900">
              Unsere Mission
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light leading-relaxed mb-6 md:mb-8">
              Skifahren für jeden zugänglich und genießbar zu machen. Ob Anfänger oder Profi – 
              wir bieten Ihnen die Ausrüstung, das Wissen und den Support, den Sie für Ihre Zeit auf der Piste brauchen.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg text-sm md:text-base"
            >
              Produkte entdecken
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
