"use client";
import { useState, useEffect } from 'react';
import { Gamepad2, Film, Plus, Trash2, Pencil, X, Check } from 'lucide-react';

export default function Home() {
  const [itens, setItens] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Jogo');
  
  const [editandoId, setEditandoId] = useState(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editCategoria, setEditCategoria] = useState('');

  const fetchItens = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/itens');
      const data = await res.json();
      setItens(data);
    } catch (error) {
      console.error("Erro ao buscar itens", error);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo) return;
    
    // Adicionamos um pequeno delay visual pois a busca na web pode levar 1 ou 2 segundos
    await fetch('http://localhost:5000/api/itens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, categoria })
    });
    setTitulo('');
    fetchItens();
  };

  const handleExcluir = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    await fetch(`http://localhost:5000/api/itens/${id}`, { method: 'DELETE' });
    fetchItens();
  };

  const iniciarEdicao = (item) => {
    setEditandoId(item.id);
    setEditTitulo(item.titulo);
    setEditCategoria(item.categoria);
  };

  const salvarEdicao = async (id) => {
    await fetch(`http://localhost:5000/api/itens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: editTitulo, categoria: editCategoria })
    });
    setEditandoId(null);
    fetchItens();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Catálogo de Entretenimento
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 mb-10 flex gap-4 items-center">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título (ex: Minecraft)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <select 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
          >
            <option value="Jogo">Jogo</option>
            <option value="Filme">Filme</option>
          </select>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus size={20} /> Adicionar
          </button>
        </form>

        <div className="grid gap-4">
          {itens.map((item) => (
            <div key={item.id} className="bg-slate-900 p-5 rounded-lg border border-slate-800 flex items-center gap-5 hover:border-slate-700 transition-colors">
              
              {/* NOVA LÓGICA DE IMAGEM AQUI */}
              {item.imagem_url ? (
                <img 
                  src={item.imagem_url} 
                  alt={item.titulo} 
                  className="w-16 h-20 object-cover rounded-md shadow-md border border-slate-700 bg-slate-800"
                />
              ) : (
                <div className={`p-4 rounded-xl min-w-16 min-h-20 flex items-center justify-center ${item.categoria === 'Jogo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {item.categoria === 'Jogo' ? <Gamepad2 size={28} /> : <Film size={28} />}
                </div>
              )}

              {/* Modo Edição vs Visualização (Restante do código igual) */}
              {editandoId === item.id ? (
                <div className="flex-1 flex gap-3 items-center">
                  <input
                    type="text"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                  <select 
                    value={editCategoria} 
                    onChange={(e) => setEditCategoria(e.target.value)}
                    className="bg-slate-950 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Jogo">Jogo</option>
                    <option value="Filme">Filme</option>
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{item.titulo}</h2>
                  <span className="text-sm text-slate-400 uppercase tracking-wider">{item.categoria}</span>
                </div>
              )}

              <div className="flex gap-2">
                {editandoId === item.id ? (
                  <>
                    <button onClick={() => salvarEdicao(item.id)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors" title="Salvar">
                      <Check size={20} />
                    </button>
                    <button onClick={() => setEditandoId(null)} className="p-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors" title="Cancelar">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => iniciarEdicao(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Editar">
                      <Pencil size={20} />
                    </button>
                    <button onClick={() => handleExcluir(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Excluir">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}