import React, { useState } from 'react';

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateDermAPI = () => {
    const fakeDiagnostics = [
      { name: 'Eczéma léger', risk: 'Faible', advice: 'Hydratez la peau et évitez les irritants.' },
      { name: 'Réaction allergique', risk: 'Moyen', advice: 'Appliquez une crème apaisante, consultez si ça persiste.' },
      { name: 'Acné inflammatoire', risk: 'Faible', advice: 'Nettoyez doucement la zone, possible traitement dermatologique.' },
      { name: 'Infection cutanée', risk: 'Élevé', advice: 'Consultez rapidement un dermatologue.' }
    ];
    return fakeDiagnostics[Math.floor(Math.random() * fakeDiagnostics.length)];
  };

  const analyzeImage = async () => {
    if (!image) {
      alert('Veuillez choisir une photo.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analyse cette image dermatologique et décris brièvement ce que tu observes." },
                {
                  type: "image_url",
                  image_url: { url: image }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || "Pas de réponse de l'IA.";
      setResult(aiMessage);

      const simulated = simulateDermAPI();
      setDiagnostic(simulated);

    } catch (error) {
      console.error("Erreur OpenAI:", error);
      setResult("Erreur lors de l'analyse de l'image.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Analyse Dermatologique Hybride</h1>
      <label className="border border-dashed border-gray-400 p-4 rounded-lg text-center cursor-pointer mb-4 w-full max-w-md">
        {image ? (
          <img src={image} alt="Prévisualisation" className="w-full rounded-md" />
        ) : (
          <span className="text-gray-500">📷 Cliquez pour prendre une photo ou en importer</span>
        )}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
      </label>
      <button
        onClick={analyzeImage}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Analyse en cours...' : 'Analyser la photo'}
      </button>
      {result && (
        <div className="mt-6 p-4 bg-white rounded-md shadow-md w-full max-w-md">
          <h2 className="font-semibold mb-2">Résultat IA :</h2>
          <p className="text-gray-700 whitespace-pre-line">{result}</p>
        </div>
      )}
      {diagnostic && (
        <div className="mt-4 p-4 bg-white rounded-md shadow-md w-full max-w-md">
          <h2 className="font-semibold mb-2">Diagnostic simulé :</h2>
          <p><strong>Pathologie probable :</strong> {diagnostic.name}</p>
          <p><strong>Niveau de risque :</strong> {diagnostic.risk}</p>
          <p><strong>Conseil :</strong> {diagnostic.advice}</p>
          <p className="text-xs text-red-500 mt-2">⚠️ Analyse indicative, ne remplace pas un avis médical.</p>
        </div>
      )}
    </div>
  );
}
