// Ordenação alfabética consistente em todas as telas, respeitando o português.
const categoryCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export function sortCategories(categories) {
  return [...categories].sort((a, b) => categoryCollator.compare(a.name || '', b.name || ''));
}
