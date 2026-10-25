import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import TarjetaTaller from '../../components/TarjetaTaller';
import estilos from '../../styles/Talleres.module.css';

export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState(''); // Estado para el buscador

  useEffect(() => { 
    cargarTalleres(); 
  }, []); 

  async function cargarTalleres() { 
    try { 
      setTalleres(await pedirJSON('/talleres')); 
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setCargando(false); 
    } 
  }

  // Filtrado local de talleres por nombre o instructor
  const texto = busqueda.trim().toLowerCase();
  const visibles = talleres.filter((t) => 
    `${t.nombre} ${t.instructor || ''}`.toLowerCase().includes(texto)
  );

  return (
    <main>
      <h1>Talleres</h1>
      
      {/* Input del buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre o instructor"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className={estilos.buscador}
      />

      {cargando && <p>Cargando talleres…</p>} 
      {error && <p className="error">{error}</p>} 
      {!cargando && !error && talleres.length === 0 && <p>No hay talleres registrados.</p>}
      
      {/* Mensaje si hay talleres pero el filtro no arroja resultados */}
      {!cargando && !error && talleres.length > 0 && visibles.length === 0 && (
        <p>No hay talleres que coincidan con la búsqueda.</p>
      )}

      <div className={estilos.rejilla}> 
        {visibles.map((t) => ( 
          <TarjetaTaller key={t.id} taller={t} /> 
        ))} 
      </div>
    </main>
  );
}