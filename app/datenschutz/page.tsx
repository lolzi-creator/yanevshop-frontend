import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <section className="flex-grow pt-36 md:pt-40 lg:pt-44 pb-12 md:pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-slate-900">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <p className="text-sm text-slate-500 mb-8">
              Stand: {new Date().toLocaleDateString('de-CH')}
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">1. Verantwortliche Stelle</h2>
              <p>
                <strong>Swiss-Shop Yanev</strong><br />
                Cordaststrasse 23<br />
                3212 Gurmels<br />
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
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">2. Datenerhebung und -speicherung</h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">2.1 Beim Besuch unserer Website</h3>
              <p>
                Beim Aufruf unserer Website werden automatisch folgende Daten in den Server-Logfiles gespeichert:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP-Adresse</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Browsertyp und -version</li>
                <li>Betriebssystem</li>
                <li>Referrer-URL (die zuvor besuchte Seite)</li>
                <li>Angeforderte Datei</li>
              </ul>
              <p className="mt-4">
                Diese Daten dienen der Sicherstellung eines störungsfreien Betriebs der Seite und werden nach 7 Tagen automatisch gelöscht.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-900">2.2 Bei der Registrierung</h3>
              <p>
                Bei der Registrierung auf unserer Website erheben wir folgende Daten:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>E-Mail-Adresse</li>
                <li>Name (optional)</li>
                <li>Telefonnummer (optional)</li>
              </ul>
              <p className="mt-4">
                Diese Daten werden zur Erfüllung des Vertrags und zur Kommunikation mit Ihnen verwendet.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-slate-900">2.3 Bei einer Bestellung</h3>
              <p>
                Bei einer Bestellung erheben wir zusätzlich:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lieferadresse</li>
                <li>Zahlungsinformationen (über Stripe verarbeitet)</li>
                <li>Bestelldaten</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">3. Verwendung Ihrer Daten</h2>
              <p>Wir verwenden Ihre Daten für folgende Zwecke:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vertragserfüllung und Bestellabwicklung</li>
                <li>Kommunikation bezüglich Ihrer Bestellung</li>
                <li>Versand von Bestellbestätigungen und Updates</li>
                <li>Kundenservice und Support</li>
                <li>Rechtliche Verpflichtungen (z.B. Aufbewahrung von Rechnungen)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">4. Weitergabe von Daten</h2>
              <p>Wir geben Ihre Daten nur an folgende Dritte weiter:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> Für die Zahlungsabwicklung (Zahlungsinformationen werden direkt an Stripe übermittelt)</li>
                <li><strong>Supabase:</strong> Für Datenbank- und Authentifizierungsservices</li>
                <li><strong>Resend:</strong> Für den Versand von E-Mails</li>
                <li><strong>Versanddienstleister:</strong> Für die Zustellung Ihrer Bestellung</li>
              </ul>
              <p className="mt-4">
                Alle Dienstleister sind vertraglich verpflichtet, Ihre Daten gemäss DSGVO zu schützen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">5. Cookies</h2>
              <p>
                Wir verwenden technisch notwendige Cookies für die Funktionalität der Website (z.B. Warenkorb, Authentifizierung).
                Diese Cookies sind für die Grundfunktionen der Website erforderlich.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">6. Ihre Rechte</h2>
              <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                <li><strong>Berichtigungsrecht:</strong> Sie können die Berichtigung unrichtiger Daten verlangen</li>
                <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen (sofern keine gesetzlichen Aufbewahrungspflichten bestehen)</li>
                <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen</li>
                <li><strong>Datenübertragbarkeit:</strong> Sie können die Übertragung Ihrer Daten in einem strukturierten Format verlangen</li>
              </ul>
              <p className="mt-4">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter: <a href="mailto:info@yanev-shop.ch" className="text-slate-900 underline">info@yanev-shop.ch</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">7. Datensicherheit</h2>
              <p>
                Wir setzen technische und organisatorische Massnahmen ein, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Zerstörung zu schützen.
                Die Übertragung von Daten erfolgt verschlüsselt über HTTPS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">8. Aufbewahrungsdauer</h2>
              <p>
                Wir speichern Ihre Daten nur so lange, wie es für die Vertragserfüllung und zur Erfüllung gesetzlicher Aufbewahrungspflichten erforderlich ist.
                Rechnungen werden gemäss schweizerischem Recht 10 Jahre aufbewahrt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">9. Änderungen dieser Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen. Die aktuelle Version ist jederzeit auf dieser Seite abrufbar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">10. Kontakt</h2>
              <p>
                Bei Fragen zum Datenschutz können Sie uns jederzeit kontaktieren:
              </p>
              <p className="mt-4">
                <strong>Swiss-Shop Yanev</strong><br />
                Cordaststrasse 23<br />
                3212 Gurmels<br />
                Schweiz<br />
                E-Mail: <a href="mailto:info@yanev-shop.ch" className="text-slate-900 underline">info@yanev-shop.ch</a>
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

