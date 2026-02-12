"use client"
import { useState,useEffect } from "react";
import dynamic from "next/dynamic";
import { getTextById } from "@/app/utils/textUtils";
import { useSearchParams } from 'next/navigation'

export default function Content({lang,copy}){
    const searchParams = useSearchParams()
 
    const clean = searchParams.get('clean')
    const cacheKey = searchParams.get('key')
  
    const [cacheData, setCacheData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputKey, setInputKey] = useState(cacheKey || "");
useEffect(()=>{
    if(clean) handleResetCache()
    else fetchServerCache()
  return 
},[])
  async function fetchServerCache() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cache");
      if (!res.ok) throw new Error("No se pudo obtener el caché del servidor");
      const data = await res.json();
      setCacheData(data.cache);
    } catch (e) {
      setError("Error al obtener el caché: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetCache() {
    const keyToUse = inputKey || cacheKey;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cache", { 
        method: "DELETE",
        headers: keyToUse ? { "x-cache-key": keyToUse } : {}
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Key inválida o no proporcionada");
        throw new Error("No se pudo limpiar el caché del servidor");
      }
      setCacheData({});
    } catch (e) {
      setError("Error al limpiar el caché: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full mx-auto py-8 px-4 flex flex-col gap-m ">
        <h1 className="text-2xl font-bold">{getTextById(copy,"title",lang)}</h1>
        <div className="flex gap-m items-center flex-wrap">
          <button
            className="w-fit remove-from-capture cursor-pointer inline-flex items-center gap-s bg-white text-blue-CAF font-bold px-3 focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white border-1 hover:border-white border-black hover:bg-navy hover:text-white transition-all duration-300 justify-between data-[open]:rotate-0 py-s description group"
            onClick={fetchServerCache}
            disabled={loading}
          >
            {getTextById(copy,"view",lang)}
          </button>
          <div className="flex gap-s items-center">
            
            <button
              className="w-fit remove-from-capture cursor-pointer inline-flex items-center gap-s bg-white text-blue-CAF font-bold px-3 focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white border-1 hover:border-white border-black hover:bg-navy hover:text-white transition-all duration-300 justify-between data-[open]:rotate-0 py-s description group"
              onClick={handleResetCache}
              disabled={loading}
            >
              {getTextById(copy,"clean",lang)}
            </button>
            <input
              type="password"
              placeholder="Cache Key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="border border-black px-3 py-s description focus:outline-none focus:border-blue-CAF"
            />
          </div>
        </div>
       
      
            {error && <div>{error}</div>}
       
          {cacheData !==null? <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs text-black">{JSON.stringify(cacheData, null, 2)}</pre> : ""}
        
      </div>
    </div>
  );
}