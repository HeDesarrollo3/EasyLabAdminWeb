import Shell from '../components/Shell';
import ContentSection from '../components/ContentSection';

const ABOUT_ICONS = ['groups', 'track-changes', 'visibility', 'star', 'workspace-premium', 'verified', 'favorite', 'history'];

export default function AboutUsPage() {
  return (
    <Shell title="Quiénes Somos" subtitle="Textos institucionales de la pantalla Higuera Escalante en la app">
      <ContentSection
        section="about"
        title="Secciones institucionales"
        description="Quiénes somos, Misión, Visión u otras secciones. Se muestran en el orden indicado."
        itemName="sección"
        emptyText="No hay secciones. La app mostrará los textos por defecto."
        fields={{
          title: 'Título de la sección',
          titlePlaceholder: 'Ej: NUESTRA MISIÓN',
          subtitle: 'Frase destacada (opcional)',
          body: 'Texto',
          bodyRows: 8,
          icon: true,
        }}
        iconOptions={ABOUT_ICONS}
      />
    </Shell>
  );
}
