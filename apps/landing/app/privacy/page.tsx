import { H2, LegalPage, P, UL } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata = {
  title: 'Privacy Policy · Política de privacidad — Stoic Piggy',
  description:
    "How Stoic Piggy collects, uses, and protects family data, including children's data under COPPA and GDPR-K.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title={{ es: 'Política de privacidad', en: 'Privacy Policy' }}
      effectiveDate={LEGAL.effectiveDate}
      bodies={{ es: <PrivacyES />, en: <PrivacyEN /> }}
    />
  );
}

function PrivacyEN() {
  return (
    <>
      <P>
        This Privacy Policy explains how {LEGAL.company} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), the
        operator of {LEGAL.appName}, collects, uses, and protects information when you and your
        children use the {LEGAL.appName} mobile app and website. Because {LEGAL.appName} is designed
        for families and is used by children, we follow the U.S. Children&rsquo;s Online Privacy
        Protection Act (COPPA) and the EU/UK GDPR rules for children (&ldquo;GDPR-K&rdquo;).
      </P>

      <H2>The short version</H2>
      <UL>
        <li>
          A parent creates and controls the family account. Children sign in to a profile the parent
          set up for them.
        </li>
        <li>
          We collect only what the app needs to work: account details and the child&rsquo;s in-app
          savings activity. We never run ads, never use third-party analytics or trackers, and never
          sell data.
        </li>
        <li>
          The AI coach runs entirely on the child&rsquo;s device. Your child&rsquo;s questions and
          money data are never sent to us or to any AI provider for that feature.
        </li>
        <li>A parent can delete the account and all associated data at any time.</li>
      </UL>

      <H2>Accounts and parental consent</H2>
      <P>
        {LEGAL.appName} uses a parent-controlled model. A parent or guardian creates the account
        with their email address and creates a separate, parent-managed profile for each child (a
        display name, a login username, and a password the parent sets). Creating a child&rsquo;s
        profile is the act through which the parent provides verifiable consent, under COPPA and
        GDPR-K, to our collection of that child&rsquo;s information as described here. Children
        cannot create accounts on their own.
      </P>

      <H2>Information we collect</H2>
      <P>From the parent (account holder):</P>
      <UL>
        <li>
          Email address (for sign-in and transactional email such as verification and password
          reset).
        </li>
        <li>Display name.</li>
        <li>A securely hashed password (we never store or see the plain password).</li>
        <li>Account preferences (e.g. notification and auto-approval settings).</li>
      </UL>
      <P>From or about each child (provided and managed by the parent, plus generated in-app):</P>
      <UL>
        <li>Display name and login username.</li>
        <li>A securely hashed password.</li>
        <li>
          Age, if the parent chooses to provide it (optional), used only to tailor in-app content.
        </li>
        <li>
          In-app financial-learning activity: piggy-bank balances, savings goals, allowance and
          task/chore records, resisted-impulse logs, lesson and quest progress, and experience
          points. These are educational records inside the app and do not involve real bank
          accounts, card numbers, or payments.
        </li>
      </UL>
      <P>
        We do not collect precise location, contacts, photos, advertising identifiers, or any data
        for advertising or cross-app tracking. {LEGAL.appName} contains no third-party advertising
        or analytics SDKs.
      </P>

      <H2>The on-device AI coach</H2>
      <P>
        The optional &ldquo;Zen Piggy&rdquo; coach uses an AI model that downloads once and then
        runs entirely on the child&rsquo;s device. Chat messages are processed locally, are not
        stored on our servers, and are not sent to us or to any third-party AI provider. The
        coach&rsquo;s suggestions are educational and may be imperfect; the app reminds children to
        talk with a trusted adult about money decisions.
      </P>

      <H2>How we use information</H2>
      <UL>
        <li>To provide and operate the app&rsquo;s features for your family.</li>
        <li>To authenticate sign-ins and keep accounts secure.</li>
        <li>
          To send the parent essential transactional emails (email verification, password reset, and
          account-deletion requests).
        </li>
        <li>To tailor the educational experience (e.g. age-appropriate goal suggestions).</li>
      </UL>
      <P>
        We do not use any information for advertising, profiling for marketing, or sale to third
        parties.
      </P>

      <H2>Service providers (sub-processors)</H2>
      <P>We use a small number of vetted providers strictly to operate the service:</P>
      <UL>
        <li>
          <strong>Render</strong> — hosting for our application server.
        </li>
        <li>
          <strong>Neon</strong> — managed PostgreSQL database that stores account and in-app
          activity data.
        </li>
        <li>
          <strong>Resend</strong> — delivery of transactional emails to parents (receives the parent
          email address and the message only; no child data).
        </li>
        <li>
          <strong>Cloudflare</strong> — website hosting, DNS, and security.
        </li>
      </UL>
      <P>
        These providers process data only on our behalf and are not permitted to use it for their
        own purposes.
      </P>

      <H2>Children&rsquo;s privacy (COPPA &amp; GDPR-K)</H2>
      <P>
        We collect children&rsquo;s information only with verifiable parental consent (given when
        the parent creates the child&rsquo;s profile) and only as needed to provide the app&rsquo;s
        educational features. We do not condition a child&rsquo;s participation on disclosing more
        than is reasonably necessary, and we do not use children&rsquo;s data for advertising or
        behavioral profiling. A parent may, at any time:
      </P>
      <UL>
        <li>Review the personal information we hold about their child.</li>
        <li>Ask us to correct or delete it.</li>
        <li>
          Refuse further collection or use by deleting the child&rsquo;s profile or the account.
        </li>
      </UL>
      <P>
        To exercise these rights, use the in-app controls (see &ldquo;Your choices and
        deletion&rdquo;) or contact us at {LEGAL.privacyEmail}.
      </P>

      <H2>Your choices and deletion</H2>
      <P>
        A parent can permanently delete the entire account from the parent dashboard (Settings →
        Delete account). Deletion permanently removes the parent account and all associated
        children&rsquo;s profiles and activity (piggy banks, transactions, goals, quests, tasks, and
        logs) from our active systems. From inside the children&rsquo;s app, a child can send a
        deletion request, which emails the parent a link to complete the deletion. You may also
        email {LEGAL.privacyEmail} to request deletion. Residual copies may remain in encrypted
        backups for a limited period before being overwritten.
      </P>

      <H2>Data security</H2>
      <P>
        Passwords are stored only as salted hashes. Data is encrypted in transit (HTTPS/TLS).
        Authentication uses signed tokens, stored on the device&rsquo;s secure keychain. No method
        of transmission or storage is perfectly secure, but we take reasonable measures appropriate
        to the sensitivity of the data.
      </P>

      <H2>Data retention &amp; location</H2>
      <P>
        We retain account and activity data for as long as the account is active, and delete it
        after account deletion as described above. Data may be processed in the United States by our
        service providers; by using the app you understand your information may be transferred to
        and processed there.
      </P>

      <H2>Your rights</H2>
      <P>
        Depending on where you live, you may have rights to access, correct, delete, or restrict the
        processing of your personal information (for example under GDPR or the CCPA). Parents may
        exercise these rights on behalf of their children. Contact {LEGAL.privacyEmail} and we will
        respond as required by law.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this Privacy Policy from time to time. We will post the updated version here
        and revise the effective date above; material changes affecting children&rsquo;s data will
        be communicated to parents.
      </P>

      <H2>Contact us</H2>
      <P>
        {LEGAL.company}
        <br />
        {LEGAL.address}
        <br />
        Privacy: {LEGAL.privacyEmail}
        <br />
        Support: {LEGAL.supportEmail}
      </P>
    </>
  );
}

function PrivacyES() {
  return (
    <>
      <P>
        Esta Política de privacidad explica cómo {LEGAL.company} (&ldquo;nosotros&rdquo;), operador
        de {LEGAL.appName}, recopila, usa y protege la información cuando tú y tus hijos usan la
        aplicación móvil y el sitio web de {LEGAL.appName}. Como {LEGAL.appName} está diseñada para
        familias y la usan menores, cumplimos con la Ley de Protección de la Privacidad Infantil en
        Línea de EE. UU. (COPPA) y con las reglas del RGPD de la UE/Reino Unido para menores
        (&ldquo;GDPR-K&rdquo;).
      </P>

      <H2>La versión corta</H2>
      <UL>
        <li>
          Una madre, padre o tutor crea y controla la cuenta familiar. Los menores inician sesión en
          un perfil que el adulto creó para ellos.
        </li>
        <li>
          Solo recopilamos lo que la app necesita para funcionar: datos de la cuenta y la actividad
          de ahorro del menor dentro de la app. Nunca mostramos publicidad, nunca usamos analítica
          ni rastreadores de terceros y nunca vendemos datos.
        </li>
        <li>
          El coach con IA funciona completamente en el dispositivo del menor. Las preguntas y los
          datos de dinero de tu hijo nunca se envían a nosotros ni a ningún proveedor de IA para esa
          función.
        </li>
        <li>
          El adulto puede eliminar la cuenta y todos los datos asociados en cualquier momento.
        </li>
      </UL>

      <H2>Cuentas y consentimiento parental</H2>
      <P>
        {LEGAL.appName} usa un modelo controlado por el adulto. La madre, el padre o el tutor crea
        la cuenta con su correo electrónico y crea un perfil aparte, administrado por el adulto,
        para cada menor (un nombre para mostrar, un usuario de inicio de sesión y una contraseña que
        el adulto define). Crear el perfil de un menor es el acto mediante el cual el adulto otorga
        su consentimiento verificable, conforme a COPPA y GDPR-K, para que recopilemos la
        información de ese menor según se describe aquí. Los menores no pueden crear cuentas por su
        cuenta.
      </P>

      <H2>Información que recopilamos</H2>
      <P>Del adulto (titular de la cuenta):</P>
      <UL>
        <li>
          Correo electrónico (para iniciar sesión y para correos transaccionales como la
          verificación y el restablecimiento de contraseña).
        </li>
        <li>Nombre para mostrar.</li>
        <li>
          Una contraseña almacenada de forma segura mediante hash (nunca guardamos ni vemos la
          contraseña en texto plano).
        </li>
        <li>Preferencias de la cuenta (p. ej. notificaciones y aprobación automática).</li>
      </UL>
      <P>
        De cada menor o sobre él (proporcionada y administrada por el adulto, más lo que se genera
        en la app):
      </P>
      <UL>
        <li>Nombre para mostrar y usuario de inicio de sesión.</li>
        <li>Una contraseña almacenada de forma segura mediante hash.</li>
        <li>
          Edad, si el adulto decide proporcionarla (opcional), usada solo para adaptar el contenido
          de la app.
        </li>
        <li>
          Actividad de educación financiera dentro de la app: saldos de la alcancía, metas de
          ahorro, registros de domingo/tareas, registros de impulsos resistidos, progreso de
          lecciones y misiones, y puntos de experiencia. Son registros educativos dentro de la app y
          no implican cuentas bancarias reales, números de tarjeta ni pagos.
        </li>
      </UL>
      <P>
        No recopilamos ubicación precisa, contactos, fotos, identificadores de publicidad, ni datos
        para publicidad o rastreo entre apps. {LEGAL.appName} no incluye ningún SDK de publicidad ni
        de analítica de terceros.
      </P>

      <H2>El coach con IA en el dispositivo</H2>
      <P>
        El coach opcional &ldquo;Cochinita Zen&rdquo; usa un modelo de IA que se descarga una sola
        vez y luego funciona completamente en el dispositivo del menor. Los mensajes del chat se
        procesan de forma local, no se guardan en nuestros servidores y no se envían a nosotros ni a
        ningún proveedor de IA externo. Las sugerencias del coach son educativas y pueden ser
        imperfectas; la app recuerda a los menores que hablen con un adulto de confianza sobre
        decisiones de dinero.
      </P>

      <H2>Cómo usamos la información</H2>
      <UL>
        <li>Para ofrecer y operar las funciones de la app para tu familia.</li>
        <li>Para autenticar los inicios de sesión y mantener las cuentas seguras.</li>
        <li>
          Para enviar al adulto correos transaccionales esenciales (verificación de correo,
          restablecimiento de contraseña y solicitudes de eliminación de cuenta).
        </li>
        <li>
          Para adaptar la experiencia educativa (p. ej. sugerencias de metas apropiadas para la
          edad).
        </li>
      </UL>
      <P>
        No usamos ninguna información para publicidad, perfilado con fines de marketing ni venta a
        terceros.
      </P>

      <H2>Proveedores de servicio (subencargados)</H2>
      <P>
        Usamos un número reducido de proveedores verificados, estrictamente para operar el servicio:
      </P>
      <UL>
        <li>
          <strong>Render</strong> — alojamiento de nuestro servidor de aplicación.
        </li>
        <li>
          <strong>Neon</strong> — base de datos PostgreSQL administrada que almacena los datos de la
          cuenta y la actividad en la app.
        </li>
        <li>
          <strong>Resend</strong> — envío de correos transaccionales a los adultos (recibe solo el
          correo del adulto y el mensaje; ningún dato del menor).
        </li>
        <li>
          <strong>Cloudflare</strong> — alojamiento del sitio web, DNS y seguridad.
        </li>
      </UL>
      <P>
        Estos proveedores tratan los datos únicamente en nuestro nombre y no pueden usarlos para sus
        propios fines.
      </P>

      <H2>Privacidad de los menores (COPPA y GDPR-K)</H2>
      <P>
        Recopilamos la información de los menores solo con el consentimiento verificable del adulto
        (otorgado al crear el perfil del menor) y solo en la medida necesaria para ofrecer las
        funciones educativas de la app. No condicionamos la participación de un menor a divulgar más
        de lo razonablemente necesario, y no usamos los datos de los menores para publicidad ni
        perfilado de comportamiento. El adulto puede, en cualquier momento:
      </P>
      <UL>
        <li>Revisar la información personal que tenemos sobre su hijo.</li>
        <li>Pedirnos que la corrijamos o eliminemos.</li>
        <li>
          Rechazar la recopilación o el uso posterior eliminando el perfil del menor o la cuenta.
        </li>
      </UL>
      <P>
        Para ejercer estos derechos, usa los controles dentro de la app (consulta &ldquo;Tus
        opciones y la eliminación&rdquo;) o escríbenos a {LEGAL.privacyEmail}.
      </P>

      <H2>Tus opciones y la eliminación</H2>
      <P>
        El adulto puede eliminar de forma permanente toda la cuenta desde el panel de padres
        (Ajustes → Eliminar cuenta). La eliminación borra de forma permanente la cuenta del adulto y
        todos los perfiles y la actividad asociada de los menores (alcancías, transacciones, metas,
        misiones, tareas y registros) de nuestros sistemas activos. Desde la app de los menores, un
        menor puede enviar una solicitud de eliminación, que envía al adulto un enlace para
        completar el borrado. También puedes escribir a {LEGAL.privacyEmail} para solicitar la
        eliminación. Pueden quedar copias residuales en respaldos cifrados por un periodo limitado
        antes de sobrescribirse.
      </P>

      <H2>Seguridad de los datos</H2>
      <P>
        Las contraseñas se almacenan solo como hashes con sal. Los datos se cifran en tránsito
        (HTTPS/TLS). La autenticación usa tokens firmados, guardados en el llavero seguro del
        dispositivo. Ningún método de transmisión o almacenamiento es perfectamente seguro, pero
        tomamos medidas razonables y acordes a la sensibilidad de los datos.
      </P>

      <H2>Conservación y ubicación de los datos</H2>
      <P>
        Conservamos los datos de la cuenta y de la actividad mientras la cuenta esté activa, y los
        eliminamos tras la eliminación de la cuenta como se describe arriba. Nuestros proveedores
        pueden procesar los datos en Estados Unidos; al usar la app entiendes que tu información
        puede transferirse y procesarse allí.
      </P>

      <H2>Tus derechos</H2>
      <P>
        Según dónde vivas, puedes tener derecho a acceder, corregir, eliminar o restringir el
        tratamiento de tu información personal (por ejemplo, conforme al RGPD o a la CCPA). Los
        adultos pueden ejercer estos derechos en nombre de sus hijos. Escríbenos a{' '}
        {LEGAL.privacyEmail} y responderemos según lo exija la ley.
      </P>

      <H2>Cambios a esta política</H2>
      <P>
        Podemos actualizar esta Política de privacidad de vez en cuando. Publicaremos la versión
        actualizada aquí y revisaremos la fecha de vigencia anterior; los cambios importantes que
        afecten los datos de los menores se comunicarán a los adultos.
      </P>

      <H2>Contáctanos</H2>
      <P>
        {LEGAL.company}
        <br />
        {LEGAL.address}
        <br />
        Privacidad: {LEGAL.privacyEmail}
        <br />
        Soporte: {LEGAL.supportEmail}
      </P>
    </>
  );
}
