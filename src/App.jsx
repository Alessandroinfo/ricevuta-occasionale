import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Eraser, PenLine, X, Check, Keyboard, PenTool } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function RicevutaGenerator() {
  const [formData, setFormData] = useState({
    docNumber: '2025/08/001',
    docDate: '1 agosto 2025',
    prestatoreName: 'Alessandro Russo',
    prestatoreAddress: 'Contrada Cala Creta, 32',
    prestatoreCity: '92031 Lampedusa (AG)',
    prestatoreCF: 'RSSLSN91H21G377W',
    committenteRagione: 'TNS ict travel solutions',
    committentePIVA: 'IT13134510158',
    committenteAddress: 'Bastioni di Porta Volta, 10',
    committenteCity: '20121 Milano (MI) – Italia',
    committenteSDI: 'RS76RHR',
    oggetto: 'Consulenza architetturale piattaforma Creator',
    descrizione: 'Acconto sul compenso pattuito per prestazione di lavoro autonomo occasionale',
    compensoLordo: '3330.00',
    luogo: 'Lampedusa',
    dataFirma: '1 agosto 2025',
    nomeFirma: 'Alessandro Russo',
    noRitenuta: false,
    signature: null
  });

  const [userRole, setUserRole] = useState('prestatore'); // 'prestatore' | 'committente'
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' | 'type'
  const [typedSignature, setTypedSignature] = useState('');

  const receiptRef = useRef(null);
  const sigCanvas = useRef({});
  const textCanvasRef = useRef(null);

  // Resize canvas on modal open
  useEffect(() => {
    if (isSignatureModalOpen) {
      if (signatureMode === 'draw' && sigCanvas.current) {
        // Small timeout to ensure modal is rendered
        setTimeout(() => {
          const canvas = sigCanvas.current.getCanvas();
          if (canvas) {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            sigCanvas.current.clear(); 
          }
        }, 100);
      }
    }
  }, [isSignatureModalOpen, signatureMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const confirmSignature = () => {
    if (signatureMode === 'draw') {
      if (sigCanvas.current.isEmpty()) {
        setFormData(prev => ({ ...prev, signature: null }));
      } else {
        setFormData(prev => ({ ...prev, signature: sigCanvas.current.getCanvas().toDataURL('image/png') }));
      }
    } else {
      // Generate image from text
      const canvas = textCanvasRef.current;
      if (canvas && typedSignature.trim()) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set font and measure text
        const fontSize = 60;
        ctx.font = `${fontSize}px "Dancing Script", cursive`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text centered
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
        
        setFormData(prev => ({ ...prev, signature: canvas.toDataURL('image/png') }));
      } else {
        setFormData(prev => ({ ...prev, signature: null }));
      }
    }
    setIsSignatureModalOpen(false);
  };

  const openSignatureModal = () => {
    setIsSignatureModalOpen(true);
    setSignatureMode('draw');
    setTypedSignature(formData.nomeFirma);
  };

  const calculateRitenuta = () => {
    if (formData.noRitenuta) return '0.00';
    const lordo = parseFloat(formData.compensoLordo) || 0;
    return (lordo * 0.20).toFixed(2);
  };

  const calculateNetto = () => {
    const lordo = parseFloat(formData.compensoLordo) || 0;
    const ritenuta = parseFloat(calculateRitenuta());
    return (lordo - ritenuta).toFixed(2);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeName = formData.prestatoreName.replace(/\s+/g, '_');
    const safeDate = formData.docDate.replace(/[/\s]+/g, '_');
    document.title = `${safeName}_${safeDate}`;
    window.print();
    setTimeout(() => document.title = originalTitle, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .receipt-container { 
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            box-shadow: none;
          }
        }
        
        .form-input {
          transition: all 0.2s;
        }
        
        .form-input:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="no-print bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">Ricevuta Occasionale Online</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FileText size={18} />
              Scarica PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download size={18} />
              Esporta
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Sidebar */}
          <div className="no-print lg:col-span-4 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-6">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Generatore Ricevute Fiscali</h2>
              <p className="text-sm text-gray-600 mt-1">Prestazione Occasionale - Art. 2222 C.C.</p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Ricevuta</h3>
            
            {/* Role Switcher */}
            <div className="mb-6 bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setUserRole('prestatore')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  userRole === 'prestatore' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sono il Prestatore
              </button>
              <button
                onClick={() => setUserRole('committente')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  userRole === 'committente' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sono il Committente
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm text-blue-800">
              <p className="font-medium mb-1">
                {userRole === 'prestatore' ? '👋 Ciao Prestatore!' : '👋 Ciao Committente!'}
              </p>
              <p>
                {userRole === 'prestatore' 
                  ? 'Compila questo modulo con i tuoi dati e quelli del tuo cliente. Genererai la ricevuta da firmare e consegnare per ricevere il pagamento.'
                  : 'Compila questo modulo con i dati del tuo collaboratore occasionale. Genererai la ricevuta che lui dovrà firmare per ricevere il pagamento.'}
              </p>
            </div>

            <div className="space-y-5">
              {/* Documento */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Documento</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero Documento</label>
                  <input
                    type="text"
                    name="docNumber"
                    value={formData.docNumber}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Documento</label>
                  <input
                    type="text"
                    name="docDate"
                    value={formData.docDate}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prestatore */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  {userRole === 'prestatore' ? 'Prestatore di Servizi (Tu)' : 'Prestatore di Servizi (Collaboratore)'}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
                  <input
                    type="text"
                    name="prestatoreName"
                    value={formData.prestatoreName}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input
                    type="text"
                    name="prestatoreAddress"
                    value={formData.prestatoreAddress}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                  <input
                    type="text"
                    name="prestatoreCity"
                    value={formData.prestatoreCity}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                  <input
                    type="text"
                    name="prestatoreCF"
                    value={formData.prestatoreCF}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Committente */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  {userRole === 'prestatore' ? 'Committente (Cliente)' : 'Committente (La tua Azienda)'}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ragione Sociale</label>
                  <input
                    type="text"
                    name="committenteRagione"
                    value={formData.committenteRagione}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                  <input
                    type="text"
                    name="committentePIVA"
                    value={formData.committentePIVA}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input
                    type="text"
                    name="committenteAddress"
                    value={formData.committenteAddress}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                  <input
                    type="text"
                    name="committenteCity"
                    value={formData.committenteCity}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice SDI</label>
                  <input
                    type="text"
                    name="committenteSDI"
                    value={formData.committenteSDI}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prestazione */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Prestazione</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oggetto</label>
                  <textarea
                    name="oggetto"
                    value={formData.oggetto}
                    onChange={handleChange}
                    rows="2"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleChange}
                    rows="2"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compenso Lordo (€)</label>
                  <input
                    type="number"
                    name="compensoLordo"
                    value={formData.compensoLordo}
                    onChange={handleChange}
                    step="0.01"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {parseFloat(formData.compensoLordo) > 77.47 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      ⚠️ Marca da bollo da € 2,00 necessaria (superati € 77,47)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noRitenuta"
                    name="noRitenuta"
                    checked={formData.noRitenuta}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noRitenuta" className="text-sm text-gray-700">
                    Cliente forfettario/privato/estero (No Ritenuta)
                  </label>
                </div>

                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  {!formData.noRitenuta && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ritenuta d'acconto (20%):</span>
                      <span className="font-semibold">{formatCurrency(calculateRitenuta())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-medium">Importo Netto:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(calculateNetto())}</span>
                  </div>
                </div>
              </div>

              {/* Firma */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Firma</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
                  <input
                    type="text"
                    name="luogo"
                    value={formData.luogo}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Firma</label>
                  <input
                    type="text"
                    name="dataFirma"
                    value={formData.dataFirma}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Firmatario</label>
                  <input
                    type="text"
                    name="nomeFirma"
                    value={formData.nomeFirma}
                    onChange={handleChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Firma Digitale</label>
                  
                  <button
                    onClick={openSignatureModal}
                    className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <PenLine size={20} />
                    {formData.signature ? 'Modifica Firma' : 'Inserisci Firma'}
                  </button>

                  {formData.signature && (
                    <div className="mt-3 p-2 border border-gray-200 rounded bg-white text-center relative group">
                      <img src={formData.signature} alt="Anteprima Firma" className="h-12 mx-auto object-contain" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, signature: null }))}
                        className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rimuovi firma"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature Modal */}
          {isSignatureModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[80vh] md:h-[600px] overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Inserisci la tua firma</h3>
                    <p className="text-sm text-gray-500">Scegli la modalità di firma preferita</p>
                  </div>
                  <button 
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setSignatureMode('draw')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      signatureMode === 'draw' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <PenTool size={18} />
                    Disegna
                  </button>
                  <button
                    onClick={() => setSignatureMode('type')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      signatureMode === 'type' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Keyboard size={18} />
                    Digita
                  </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-white relative cursor-crosshair touch-none overflow-hidden flex flex-col items-center justify-center">
                  {signatureMode === 'draw' ? (
                    <>
                      <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        minWidth={1.5}
                        maxWidth={3.5}
                        canvasProps={{
                          className: 'absolute inset-0 w-full h-full'
                        }}
                      />
                      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-20">
                        <div className="border-b-2 border-black w-2/3 mx-auto mb-2"></div>
                        <span className="text-xl font-serif italic">Firma qui</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="w-full max-w-md px-4 py-3 text-xl border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-8 text-center"
                        placeholder="Digita il tuo nome"
                      />
                      
                      <div className="w-full max-w-xl h-40 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center relative overflow-hidden">
                        <p 
                          className="text-6xl text-black" 
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          {typedSignature || 'Tua Firma'}
                        </p>
                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-20">
                          <div className="border-b-2 border-black w-2/3 mx-auto mb-2"></div>
                        </div>
                        
                        {/* Hidden canvas for rasterization */}
                        <canvas 
                          ref={textCanvasRef} 
                          width={600} 
                          height={200} 
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Questa è una simulazione calligrafica della tua firma
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-4">
                  {signatureMode === 'draw' && (
                    <button
                      onClick={clearSignature}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <Eraser size={20} />
                      Pulisci
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button
                    onClick={confirmSignature}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200"
                  >
                    <Check size={20} />
                    Conferma Firma
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Preview */}
          <div className="lg:col-span-8">
            <div 
              ref={receiptRef}
              className="receipt-container bg-white rounded-lg shadow-2xl mx-auto"
              style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
            >
              {/* Letterhead */}
              <div className="text-center mb-10 pb-5 border-b border-black">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
                  Ricevuta per Prestazione Occasionale
                </h1>
                <p className="text-sm italic text-gray-700">
                  Art. 2222 Codice Civile – Lavoro autonomo occasionale
                </p>
              </div>

              {/* Document Number */}
              <div className="text-right text-sm mb-8">
                Doc. N. {formData.docNumber} - Data: {formData.docDate}
              </div>

              {/* Prestatore */}
              <div className="mb-6">
                <div className="font-semibold text-sm uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
                  Prestatore di Servizi
                </div>
                <div className="text-sm space-y-1">
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Denominazione:</span> {formData.prestatoreName}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Indirizzo:</span> {formData.prestatoreAddress}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Località:</span> {formData.prestatoreCity}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Codice Fiscale:</span> {formData.prestatoreCF}</div>
                </div>
              </div>

              {/* Committente */}
              <div className="mb-8">
                <div className="font-semibold text-sm uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
                  Committente
                </div>
                <div className="text-sm space-y-1">
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Ragione Sociale:</span> {formData.committenteRagione}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Partita IVA:</span> {formData.committentePIVA}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Indirizzo:</span> {formData.committenteAddress}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Località:</span> {formData.committenteCity}</div>
                  <div><span className="font-bold text-xs uppercase w-32 inline-block">Cod. Dest. SDI:</span> {formData.committenteSDI}</div>
                </div>
              </div>

              {/* Oggetto */}
              <div className="text-center py-5 my-8 border-t border-b border-black">
                <div className="font-bold text-sm uppercase tracking-wide mb-2">
                  Oggetto della Prestazione
                </div>
                <div className="font-bold text-base mb-2">{formData.oggetto}</div>
                <div className="text-sm italic text-gray-700">
                  {formData.descrizione}
                </div>
              </div>

              {/* Riepilogo Economico */}
              <div className="mb-8">
                <div className="text-center font-semibold text-sm uppercase tracking-wide py-3 border-b border-black mb-5">
                  Riepilogo Economico
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-300">
                    <span>Compenso lordo pattuito</span>
                    <span className="font-semibold">{formatCurrency(formData.compensoLordo)}</span>
                  </div>
                  {!formData.noRitenuta && (
                    <div className="flex justify-between py-2 border-b border-gray-300">
                      <span>A dedurre - Ritenuta d'acconto 20% (art. 25 DPR 600/73)</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(calculateRitenuta())}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-black mt-4 font-semibold text-base">
                    <span>IMPORTO NETTO A PAGARE</span>
                    <span>{formatCurrency(calculateNetto())}</span>
                  </div>
                </div>
              </div>

              {/* Marca da Bollo */}
              {parseFloat(formData.compensoLordo) > 77.47 && (
                <div className="text-center py-6 my-8 border-t border-b border-gray-300">
                  <div className="font-semibold text-sm uppercase tracking-wide mb-4">Marca da Bollo</div>
                  <div className="border-2 border-black w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="text-xs text-gray-500 text-center">
                      Spazio<br/>riservato<br/>€ 2,00
                    </div>
                  </div>
                </div>
              )}

              {/* Note Legali */}
              <div className="text-xs mb-8 pt-4 border-t border-gray-300">
                <div className="font-semibold uppercase tracking-wide mb-3">Riferimenti Normativi</div>
                <div className="space-y-2">
                  <div>• Prestazione di lavoro autonomo occasionale ai sensi dell'art. 67, comma 1, lett. l), del D.P.R. 917/86</div>
                  <div>• Operazione fuori campo di applicazione IVA ai sensi dell'art. 5, D.P.R. 633/1972</div>
                </div>
              </div>

              {/* Dichiarazione */}
              <div className="text-xs mb-8 pt-4 border-t border-gray-300">
                <div className="font-semibold uppercase tracking-wide mb-3">Dichiarazione del Prestatore</div>
                <p className="text-justify leading-relaxed">
                  Il sottoscritto dichiara che la presente prestazione è svolta in modo occasionale e senza vincolo di subordinazione, 
                  come previsto dall'art. 2222 del Codice Civile, e che non ricorrono i presupposti di abitualità tali da configurare 
                  attività d'impresa o professionale ai sensi dell'art. 2082 c.c.
                </p>
              </div>

              {/* Firma */}
              <div className="flex justify-between mt-12">
                <div className="text-center w-5/12">
                  <div className="font-semibold text-xs uppercase tracking-wide mb-2">Luogo e Data</div>
                  <div className="font-bold">{formData.luogo}, {formData.dataFirma}</div>
                </div>
                <div className="text-center w-5/12">
                  <div className="font-semibold text-xs uppercase tracking-wide mb-2">Firma del Prestatore</div>
                  <div 
                    onClick={openSignatureModal}
                    className="border-b-2 border-black h-16 mb-2 flex items-end justify-center cursor-pointer hover:bg-gray-50 transition-colors group relative"
                    title="Clicca per firmare"
                  >
                    {formData.signature ? (
                      <img src={formData.signature} alt="Firma" className="h-14 object-contain" />
                    ) : (
                      <span className="text-gray-300 text-xs italic pb-2 group-hover:text-blue-600">Clicca per firmare</span>
                    )}
                  </div>
                  <div className="font-semibold">{formData.nomeFirma}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
                Documento generato in conformità alle disposizioni fiscali vigenti
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
