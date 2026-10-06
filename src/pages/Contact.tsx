import Shell from '../components/Shell';
import ContentSection from '../components/ContentSection';

const CONTACT_ICONS = ['call', 'two-wheeler', 'mail', 'language', 'whatsapp', 'smartphone', 'support-agent', 'location-on', 'schedule'];
const SOCIAL_ICONS = ['facebook', 'camera-alt', 'smart-display', 'alternate-email', 'public', 'link'];

export default function ContactPage() {
  return (
    <Shell title="Contacto y Redes" subtitle="Canales que ve el usuario en Contáctenos y en Quiénes somos">
      <ContentSection
        section="contact"
        title="Canales de contacto"
        description="Teléfonos, correo y sitio web. El enlace define qué abre la app al tocarlo (tel:, mailto:, https://)."
        itemName="canal"
        emptyText="No hay canales de contacto. La app mostrará los valores por defecto."
        fields={{
          title: 'Etiqueta',
          titlePlaceholder: 'Ej: LÍNEA GENERAL',
          body: 'Valor visible',
          bodyRows: 1,
          url: 'Enlace al tocar',
          urlPlaceholder: 'tel:+576076787870 · mailto:correo@dominio.com · https://...',
          icon: true,
        }}
        iconOptions={CONTACT_ICONS}
      />
      <ContentSection
        section="social"
        title="Redes sociales"
        description="Se muestran en la sección «Síguenos en redes»."
        itemName="red social"
        emptyText="No hay redes sociales configuradas."
        fields={{
          title: 'Red social',
          titlePlaceholder: 'Ej: INSTAGRAM',
          body: 'Usuario visible',
          bodyRows: 1,
          url: 'Enlace del perfil',
          urlPlaceholder: 'https://www.instagram.com/...',
          icon: true,
        }}
        iconOptions={SOCIAL_ICONS}
      />
    </Shell>
  );
}
