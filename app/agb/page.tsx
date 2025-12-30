import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AGBPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <section className="flex-grow pt-16 md:pt-20 lg:pt-24 pb-12 md:pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-slate-900">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <p className="text-sm text-slate-500 mb-8">
              Stand: {new Date().toLocaleDateString('de-CH')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">1. Geltungsbereich</h2>
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den Online-Shop von Yanev Shop.
                Mit der Bestellung erkennen Sie diese AGB an.
              </p>
              <p className="mt-4">
                <strong>Anbieter:</strong><br />
                Yanev Shop<br />
                {/* TODO: Fügen Sie hier Ihre vollständige Adresse ein */}
                [Ihre Adresse]<br />
                [PLZ] [Ort]<br />
                Schweiz
              </p>
              <p className="mt-4">
                <strong>Kontakt:</strong><br />
                E-Mail: info@yanev-shop.ch<br />
                {/* TODO: Fügen Sie Ihre Telefonnummer hinzu, falls vorhanden */}
                {/* Telefon: +41 XX XXX XX XX */}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">2. Vertragspartner</h2>
              <p>
                Vertragspartner ist Yanev Shop. Der Kaufvertrag kommt zwischen Ihnen und Yanev Shop zustande.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">3. Vertragsabschluss</h2>
              <p>
                Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Abgabe eines Angebots.
              </p>
              <p className="mt-4">
                Mit dem Absenden der Bestellung geben Sie ein verbindliches Angebot zum Kauf der Waren ab.
                Wir bestätigen den Eingang Ihrer Bestellung unverzüglich per E-Mail (Bestellbestätigung).
                Die Annahme Ihres Angebots erfolgt durch die Versendung der Ware oder durch eine ausdrückliche Annahmeerklärung.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">4. Preise und Zahlung</h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">4.1 Preise</h3>
              <p>
                Alle Preise verstehen sich in Schweizer Franken (CHF) inklusive Mehrwertsteuer (7.7%).
                Versandkosten werden separat ausgewiesen und sind im Bestellvorgang ersichtlich.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-900">4.2 Zahlungsarten</h3>
              <p>Wir akzeptieren folgende Zahlungsarten:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Kreditkarte (über Stripe)</li>
                <li>TWINT (über Stripe)</li>
                <li>Apple Pay (über Stripe)</li>
              </ul>
              <p className="mt-4">
                Die Zahlung erfolgt im Voraus. Die Ware wird erst nach erfolgreicher Zahlung versendet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">5. Lieferung und Versand</h2>
              <p>
                Die Lieferung erfolgt innerhalb der Schweiz. Der Versand erfolgt kostenlos.
              </p>
              <p className="mt-4">
                Die Lieferzeit beträgt in der Regel 3-5 Werktage nach Zahlungseingang.
                Bei nicht verfügbaren Artikeln informieren wir Sie umgehend und bieten Ihnen eine Alternative oder Rückerstattung an.
              </p>
              <p className="mt-4">
                {/* TODO: Fügen Sie hier Ihre Versanddienstleister ein */}
                Versanddienstleister: [z.B. Die Post, DHL, etc.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">6. Widerrufsrecht</h2>
              <p>
                Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben.
              </p>
              <p className="mt-4">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Yanev Shop, info@yanev-shop.ch) mittels einer eindeutigen Erklärung über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
              <p className="mt-4">
                <strong>Widerrufsfolgen:</strong><br />
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen 14 Tagen zurückzuzahlen.
                Die Rücksendung der Ware erfolgt auf Ihre Kosten und Gefahr.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">7. Gewährleistung und Garantie</h2>
              <p>
                Wir gewährleisten, dass die gelieferten Waren frei von Sach- und Rechtsmängeln sind.
                Die Gewährleistungsfrist beträgt 2 Jahre ab Lieferung.
              </p>
              <p className="mt-4">
                Bei Mängeln haben Sie das Recht auf Nacherfüllung (Nachbesserung oder Ersatzlieferung) oder Minderung des Kaufpreises.
                Bei erheblichen Mängeln können Sie vom Vertrag zurücktreten oder Schadensersatz verlangen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">8. Haftung</h2>
              <p>
                Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.
                Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemässe Durchführung des Vertrags überhaupt erst ermöglicht.
              </p>
              <p className="mt-4">
                Die Haftung für leichte Fahrlässigkeit ist auf den bei Vertragsschluss vorhersehbaren, typischerweise eintretenden Schaden begrenzt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">9. Datenschutz</h2>
              <p>
                Der Schutz Ihrer personenbezogenen Daten ist uns wichtig.
                Informationen zur Erhebung, Verarbeitung und Nutzung Ihrer Daten finden Sie in unserer <Link href="/datenschutz" className="text-slate-900 underline">Datenschutzerklärung</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">10. Streitbeilegung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">https://ec.europa.eu/consumers/odr</a> finden.
                Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
              <p className="mt-4">
                Es gilt schweizerisches Recht unter Ausschluss des UN-Kaufrechts.
                Gerichtsstand ist der Sitz des Verkäufers, sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">11. Schlussbestimmungen</h2>
              <p>
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.
              </p>
              <p className="mt-4">
                Wir behalten uns vor, diese AGB jederzeit zu ändern. Massgeblich ist die zum Zeitpunkt der Bestellung gültige Version.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              href="/"
              className="text-slate-900 hover:text-slate-700 transition-colors tracking-wider text-sm font-medium border-b border-slate-900"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

