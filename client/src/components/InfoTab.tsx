import React, { useEffect, useState } from 'react'

export default function InfoTab() {
  const [info, setInfo] = useState<any>(null)
  useEffect(() => {
    fetch('/info.json').then(r => r.json()).then(setInfo)
  }, [])

  if (!info) return <div>Loading info...</div>

  return (
    <div className="info-tab">
      <h2>ERD & Relational Algebra Reference</h2>
      {info.sections.map((s: any) => (
        <section key={s.id}>
          <h3>{s.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}
    </div>
  )
}
