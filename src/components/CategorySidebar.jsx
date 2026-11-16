export default function CategorySidebar({ categories, visible, toggle, eventCount }) {
  return (
    <aside className="sidebar-panel">
      <div className="sidebar-stats">
        <div className="stat-card"><small>Eventos no mês</small><strong>{eventCount}</strong></div>
        <div className="stat-card"><small>Categorias</small><strong>{categories.length}</strong></div>
      </div>
      <div className="sidebar-heading"><h3>Categorias</h3><button className="text-button" onClick={() => toggle(null)}> {visible.length === categories.length ? 'Ocultar todas' : 'Mostrar todas'}</button></div>
      <div className="category-list">
        {categories.map((category) => (
          <button key={category.id} className={`category-option ${visible.includes(category.id) ? '' : 'dimmed'}`} onClick={() => toggle(category.id)} aria-pressed={visible.includes(category.id)}>
            <span className="category-dot" style={{ background: category.color }} />
            <span>{category.name}</span>
            <span className="category-count">{category.count || 0}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
