import { useCallback, useEffect, useState } from 'react';
import api from '../api';

export type CategoryType = 'guide' | 'requirement' | 'faq';

export interface Category {
  id: number;
  type: CategoryType;
  name: string;
  label: string;
  icon: string | null;
  order: number;
  isActive: boolean;
}

/** Valores usados si la API de categorías aún no está disponible. */
const FALLBACK: Record<CategoryType, string[]> = {
  guide: ['Sangre', 'Orina', 'Imagenes', 'Otros'],
  requirement: ['General', 'Salud', 'Mitos', 'Cuidados'],
  faq: ['Resultados', 'Citas', 'Pagos', 'Ayuno'],
};

/** Carga las categorías administrables de un tipo (para selects y filtros). */
export function useCategories(type: CategoryType) {
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<any>('/categories/admin', { params: { type } });
      const list = data.data || data;
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const names = categories.length > 0 ? categories.map(c => c.name) : FALLBACK[type];
  const labelOf = (name: string) => categories.find(c => c.name === name)?.label ?? name;

  return { categories, names, labelOf, reload: load };
}

const BADGES = ['badge-red', 'badge-amber', 'badge-blue', 'badge-purple', 'badge-green'];

/** Color estable de badge según la posición de la categoría. */
export function badgeFor(names: string[], name: string) {
  const i = names.indexOf(name);
  return i === -1 ? 'badge-slate' : BADGES[i % BADGES.length];
}
