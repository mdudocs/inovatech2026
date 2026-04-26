// Estado visual comum para carregamentos de dashboards e secoes internas.
export function LoadingState() {
  return (
    <section className="feedback-card">
      <div className="spinner" />
      <div>
        <strong>Carregando portal...</strong>
        <p>Buscando os dados do perfil selecionado.</p>
      </div>
    </section>
  )
}
