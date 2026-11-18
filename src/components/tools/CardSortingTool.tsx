/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Card Sorting & Information Architecture Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, FolderPlus, Check, Clock } from 'lucide-react';
import { CardCategory, CardSortItem, Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

const DEFAULT_CARDS: CardSortItem[] = [
  { id: 'c1', label: 'Historial de Transferencias', description: 'Registro de movimientos y recibos anteriores', assignedCategory: 'cat1' },
  { id: 'c2', label: 'Pago de Servicios Públicos', description: 'Luz, agua, gas y telefonía', assignedCategory: 'cat1' },
  { id: 'c3', label: 'Certificado Tributario Anual', description: 'Descarga de retenciones y documentos', assignedCategory: 'cat2' },
  { id: 'c4', label: 'Configurar Límite Diario', description: 'Monto máximo de transferencias', assignedCategory: 'cat3' },
  { id: 'c5', label: 'Cambiar Clave de Ingreso', description: 'Biometría y PIN de 6 dígitos', assignedCategory: 'cat3' },
  { id: 'c6', label: 'Solicitar Microcrédito', description: 'Simulación a 3 o 6 meses', assignedCategory: 'cat1' },
  { id: 'c7', label: 'Preguntas Frecuentes y Chat', description: 'Ayuda con asesor humano', assignedCategory: 'cat2' },
  { id: 'c8', label: 'Notificaciones SMS', description: 'Avisos en tiempo real', assignedCategory: 'cat3' },
];

const DEFAULT_CATEGORIES: CardCategory[] = [
  { id: 'cat1', name: 'Operaciones & Dinero', color: '#22D3EE' },
  { id: 'cat2', name: 'Documentos & Soporte', color: '#B892FF' },
  { id: 'cat3', name: 'Seguridad & Ajustes', color: '#FF6B1A' },
];

export const CardSortingTool: React.FC<{ project: Project }> = ({ project }) => {
  const { updateProject, approveFinding } = useWorkspace();

  const [cards, setCards] = useState<CardSortItem[]>(
    project.cardItems && project.cardItems.length > 0 ? project.cardItems : DEFAULT_CARDS
  );
  const [categories, setCategories] = useState<CardCategory[]>(
    project.cardCategories && project.cardCategories.length > 0
      ? project.cardCategories
      : DEFAULT_CATEGORIES
  );

  const [newCardLabel, setNewCardLabel] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const prog = calculateMethodProgress(project, 'card_sorting');

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardLabel.trim()) return;

    const newCard: CardSortItem = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      label: newCardLabel,
      description: '',
      assignedCategory: categories[0]?.id,
    };

    const updated = [...cards, newCard];
    setCards(updated);
    updateProject(project.id, { cardItems: updated, cardCategories: categories });
    setNewCardLabel('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const colors = ['#22D3EE', '#B892FF', '#FF6B1A', '#EC4899', '#818CF8'];
    const newCat: CardCategory = {
      id: 'cat_' + Math.random().toString(36).substring(2, 9),
      name: newCatName,
      color: colors[categories.length % colors.length],
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    updateProject(project.id, { cardCategories: updated, cardItems: cards });
    setNewCatName('');
  };

  const moveCard = (cardId: string, categoryId: string | undefined) => {
    const updated = cards.map((c) => (c.id === cardId ? { ...c, assignedCategory: categoryId } : c));
    setCards(updated);
    updateProject(project.id, { cardItems: updated, cardCategories: categories });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="card_sorting" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Card Sorting</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'card_sorting')?.durationEstimate}</span>
              <span className="text-[#7D71A4]">· {cards.length} tarjetas · {categories.length} categorías</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => {
              approveFinding(project.id, {
                title: `Consenso de Arquitectura: ${categories.length} Categorías`,
                sourceMethod: 'card_sorting',
                severityOrImportance: 'Media',
                description: `Agrupación de ${cards.length} conceptos en ${categories.map((c) => c.name).join(', ')}.`,
                evidence: 'Matriz de card sorting.',
                recommendation: 'Estructurar navegación principal con estas categorías.',
                status: 'aprobado',
              });
            }}
            className="p-2.5 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-xl transition-colors"
            title="Aprobar estructura como hallazgo"
            aria-label="Aprobar estructura de card sorting como hallazgo"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleAddCard} className="bg-[#120E24]/80 p-3 rounded-2xl border border-[#2A2248] flex items-center gap-2">
          <input
            type="text"
            value={newCardLabel}
            onChange={(e) => setNewCardLabel(e.target.value)}
            placeholder="Nueva tarjeta..."
            className="flex-1 px-3 py-1.5 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
          />
          <button
            type="submit"
            className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg transition-colors"
            title="Añadir tarjeta"
            aria-label="Añadir tarjeta"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <form onSubmit={handleAddCategory} className="bg-[#120E24]/80 p-3 rounded-2xl border border-[#2A2248] flex items-center gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1 px-3 py-1.5 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
          />
          <button
            type="submit"
            className="p-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-lg transition-colors"
            title="Crear categoría"
            aria-label="Crear categoría"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const categoryCards = cards.filter((c) => c.assignedCategory === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] p-4 flex flex-col justify-between min-h-[300px]"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#221A3D]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <h4 className="text-sm font-semibold text-[#F4F1FF]">{cat.name}</h4>
                  </div>
                  <span className="text-xs font-mono text-[#7D71A4]">{categoryCards.length}</span>
                </div>

                <div className="space-y-2">
                  {categoryCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-[#0E0A1D] p-3 rounded-xl border border-[#241D42] hover:border-[#463578] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[#F4F1FF]">{card.label}</span>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {categories
                            .filter((c) => c.id !== cat.id)
                            .map((otherCat) => (
                              <button
                                key={otherCat.id}
                                onClick={() => moveCard(card.id, otherCat.id)}
                                className="text-[10px] px-1.5 py-0.5 bg-[#1E1638] border border-[#463578] rounded hover:border-[#B892FF] text-[#D8B4FE]"
                                title={`Mover a ${otherCat.name}`}
                              >
                                → {otherCat.name.split(' ')[0]}
                              </button>
                            ))}
                        </div>
                      </div>
                      {card.description && (
                        <p className="text-[11px] text-[#7D71A4] mt-1">{card.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
