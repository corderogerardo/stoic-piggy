import { H2, LegalPage, P, UL } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: 'Terms & Conditions · Términos y condiciones — Stoic Piggy',
  description: 'The terms that govern your use of the Stoic Piggy app and website.',
};

export default function Terms() {
  return (
    <LegalPage
      title={{ es: 'Términos y condiciones', en: 'Terms & Conditions' }}
      effectiveDate={LEGAL.effectiveDate}
      bodies={{ es: <TermsES />, en: <TermsEN /> }}
    />
  );
}

function TermsEN() {
  return (
    <>
      <P>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of {LEGAL.appName},
        operated by {LEGAL.company}. By creating an account or using the app or website, you agree
        to these Terms. If you do not agree, do not use {LEGAL.appName}.
      </P>

      <H2>1. Who may use Stoic Piggy</H2>
      <P>
        {LEGAL.appName} is intended to be set up and controlled by a parent or legal guardian
        (&ldquo;you&rdquo;), who must be at least 18 years old. You may create profiles for your own
        children and are responsible for supervising their use. You are responsible for the activity
        under your account and for keeping your credentials confidential.
      </P>

      <H2>2. Parent-controlled accounts</H2>
      <P>
        You are the account holder. You create and manage each child&rsquo;s profile and the
        credentials they use to sign in. You consent, on behalf of your child, to the data practices
        described in our{' '}
        <a className="font-bold text-accent underline" href="/privacy">
          Privacy Policy
        </a>
        . You may deactivate or delete any child profile, or the entire account, at any time.
      </P>

      <H2>3. Educational purpose — not financial advice</H2>
      <P>
        {LEGAL.appName} is an educational tool that helps children learn money habits using virtual
        balances and goals. It does not provide real banking, payments, money transfer, or
        investment services, and no real money moves through the app. Content in the app, including
        suggestions from the on-device AI coach, is for general educational purposes only, may be
        incomplete or inaccurate, and is not professional financial advice. Always use your own
        judgment and consult a qualified professional for real financial decisions.
      </P>

      <H2>4. The AI coach</H2>
      <P>
        The optional AI coach runs on the device and generates responses automatically. Because it
        is AI-generated, its output may occasionally be wrong or inappropriate despite our
        safeguards. If you encounter content that concerns you, please report it to{' '}
        {LEGAL.supportEmail}. We may update or remove the feature at any time.
      </P>

      <H2>5. Acceptable use</H2>
      <P>You agree not to:</P>
      <UL>
        <li>Use the app for any unlawful purpose or in violation of these Terms.</li>
        <li>Attempt to access accounts or data that are not yours.</li>
        <li>
          Interfere with, disrupt, reverse-engineer, or attempt to gain unauthorized access to the
          service.
        </li>
        <li>Submit content that is unlawful, harmful, or infringing.</li>
      </UL>

      <H2>6. Intellectual property</H2>
      <P>
        {LEGAL.appName}, including its software, content, and branding, is owned by {LEGAL.company}{' '}
        and protected by intellectual-property laws. We grant you a limited, non-exclusive,
        non-transferable license to use the app for your family&rsquo;s personal, non-commercial
        use.
      </P>

      <H2>7. Apple App Store terms</H2>
      <P>
        If you download {LEGAL.appName} from the Apple App Store, your use is also subject to
        Apple&rsquo;s Licensed Application End User License Agreement (EULA). Apple is not
        responsible for the app or its content, and is a third-party beneficiary of these Terms
        entitled to enforce them.
      </P>

      <H2>8. Disclaimers</H2>
      <P>
        The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
        any kind, to the fullest extent permitted by law. We do not warrant that the app will be
        uninterrupted, error-free, or secure.
      </P>

      <H2>9. Limitation of liability</H2>
      <P>
        To the fullest extent permitted by law, {LEGAL.company} will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss arising from your use
        of (or inability to use) the app.
      </P>

      <H2>10. Termination</H2>
      <P>
        You may stop using the app and delete your account at any time. We may suspend or terminate
        access if you violate these Terms or to comply with law. Upon deletion, the data-handling in
        our Privacy Policy applies.
      </P>

      <H2>11. Governing law</H2>
      <P>
        These Terms are governed by the laws of {LEGAL.jurisdiction}, without regard to
        conflict-of-law rules. Any disputes will be subject to the courts located there, except
        where applicable consumer-protection law provides otherwise.
      </P>

      <H2>12. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. We will post the updated version here and
        revise the effective date above. Continued use after changes take effect constitutes
        acceptance.
      </P>

      <H2>13. Contact</H2>
      <P>
        {LEGAL.company}
        <br />
        {LEGAL.address}
        <br />
        {LEGAL.supportEmail}
      </P>
    </>
  );
}

function TermsES() {
  return (
    <>
      <P>
        Estos Términos y condiciones (&ldquo;Términos&rdquo;) rigen tu uso de {LEGAL.appName},
        operada por {LEGAL.company}. Al crear una cuenta o usar la app o el sitio web, aceptas estos
        Términos. Si no estás de acuerdo, no uses {LEGAL.appName}.
      </P>

      <H2>1. Quién puede usar Stoic Piggy</H2>
      <P>
        {LEGAL.appName} está pensada para que la configure y controle una madre, padre o tutor legal
        (&ldquo;tú&rdquo;), que debe ser mayor de 18 años. Puedes crear perfiles para tus propios
        hijos y eres responsable de supervisar su uso. Eres responsable de la actividad en tu cuenta
        y de mantener tus credenciales confidenciales.
      </P>

      <H2>2. Cuentas controladas por el adulto</H2>
      <P>
        Tú eres el titular de la cuenta. Creas y administras el perfil de cada menor y las
        credenciales que usan para iniciar sesión. En nombre de tu hijo, das tu consentimiento a las
        prácticas de datos descritas en nuestra{' '}
        <a className="font-bold text-accent underline" href="/privacy">
          Política de privacidad
        </a>
        . Puedes desactivar o eliminar cualquier perfil de menor, o toda la cuenta, en cualquier
        momento.
      </P>

      <H2>3. Finalidad educativa — no es asesoría financiera</H2>
      <P>
        {LEGAL.appName} es una herramienta educativa que ayuda a los menores a aprender hábitos de
        dinero usando saldos y metas virtuales. No ofrece servicios reales de banca, pagos,
        transferencias ni inversión, y no mueve dinero real por la app. El contenido de la app,
        incluidas las sugerencias del coach con IA en el dispositivo, es solo para fines educativos
        generales, puede ser incompleto o inexacto, y no es asesoría financiera profesional. Usa
        siempre tu propio criterio y consulta a un profesional calificado para decisiones
        financieras reales.
      </P>

      <H2>4. El coach con IA</H2>
      <P>
        El coach con IA opcional funciona en el dispositivo y genera respuestas de forma automática.
        Como es contenido generado por IA, sus respuestas pueden ser ocasionalmente incorrectas o
        inapropiadas a pesar de nuestras protecciones. Si encuentras contenido que te preocupa,
        repórtalo a {LEGAL.supportEmail}. Podemos actualizar o eliminar la función en cualquier
        momento.
      </P>

      <H2>5. Uso aceptable</H2>
      <P>Te comprometes a no:</P>
      <UL>
        <li>Usar la app con fines ilícitos o en violación de estos Términos.</li>
        <li>Intentar acceder a cuentas o datos que no sean tuyos.</li>
        <li>
          Interferir, interrumpir, aplicar ingeniería inversa o intentar obtener acceso no
          autorizado al servicio.
        </li>
        <li>Enviar contenido ilícito, dañino o que infrinja derechos.</li>
      </UL>

      <H2>6. Propiedad intelectual</H2>
      <P>
        {LEGAL.appName}, incluido su software, contenido y marca, es propiedad de {LEGAL.company} y
        está protegida por leyes de propiedad intelectual. Te otorgamos una licencia limitada, no
        exclusiva e intransferible para usar la app para el uso personal y no comercial de tu
        familia.
      </P>

      <H2>7. Términos de la App Store de Apple</H2>
      <P>
        Si descargas {LEGAL.appName} de la App Store de Apple, tu uso también queda sujeto al
        Contrato de Licencia de Usuario Final (EULA) de Aplicación con Licencia de Apple. Apple no
        es responsable de la app ni de su contenido, y es un tercero beneficiario de estos Términos
        con derecho a hacerlos cumplir.
      </P>

      <H2>8. Renuncias de garantía</H2>
      <P>
        La app se proporciona &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;, sin
        garantías de ningún tipo, en la máxima medida permitida por la ley. No garantizamos que la
        app sea ininterrumpida, libre de errores o segura.
      </P>

      <H2>9. Limitación de responsabilidad</H2>
      <P>
        En la máxima medida permitida por la ley, {LEGAL.company} no será responsable de daños
        indirectos, incidentales, especiales, consecuentes o punitivos, ni de ninguna pérdida
        derivada de tu uso (o imposibilidad de uso) de la app.
      </P>

      <H2>10. Terminación</H2>
      <P>
        Puedes dejar de usar la app y eliminar tu cuenta en cualquier momento. Podemos suspender o
        terminar el acceso si infringes estos Términos o para cumplir con la ley. Tras la
        eliminación, aplica el tratamiento de datos de nuestra Política de privacidad.
      </P>

      <H2>11. Ley aplicable</H2>
      <P>
        Estos Términos se rigen por las leyes de {LEGAL.jurisdiction}, sin tener en cuenta sus
        normas de conflicto de leyes. Cualquier disputa quedará sujeta a los tribunales ubicados
        allí, salvo cuando la legislación de protección al consumidor aplicable disponga lo
        contrario.
      </P>

      <H2>12. Cambios a estos Términos</H2>
      <P>
        Podemos actualizar estos Términos de vez en cuando. Publicaremos la versión actualizada aquí
        y revisaremos la fecha de vigencia anterior. El uso continuado después de que los cambios
        entren en vigor constituye su aceptación.
      </P>

      <H2>13. Contacto</H2>
      <P>
        {LEGAL.company}
        <br />
        {LEGAL.address}
        <br />
        {LEGAL.supportEmail}
      </P>
    </>
  );
}
