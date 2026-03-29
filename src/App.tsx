import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Bike, 
  FileText, 
  Camera, 
  Send, 
  ArrowLeft, 
  MapPin, 
  Phone,
  Clock,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Users,
  Trash2,
  Search,
  Settings,
  DollarSign
} from 'lucide-react';
import { cn } from './lib/utils';
import { Customer, MotoModel, MOTO_PRICES, MOTO_NAMES, RentalPeriod, RENTAL_PERIOD_LABELS } from './types';
import confetti from 'canvas-confetti';
import { generateContractPDF, generateReceiptPDF } from './lib/pdf';

const WHATSAPP_NUMBER = '5592995197573';
const ADDRESS = 'Avenida BH1 Nlolo Pereira Centro em frente ao comercial Bom Motivo';
const LOGO_URL = 'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/juan-motos-logo.png'; // Placeholder, user should replace with actual logo

type View = 'home' | 'register' | 'rent' | 'receipt' | 'contract' | 'customers_list' | 'settings';

  const getContractText = (period: RentalPeriod = '18h') => `
CONTRATO DE LOCAÇÃO DE VEÍCULO - JUAN MOTOS

1. OBJETO: O presente contrato tem por objeto a locação de veículo automotor (motocicleta) de propriedade da LOCADORA JUAN MOTOS.
2. PRAZO: A locação é ${period === '18h' ? 'diária, iniciando-se na parte da manhã e encerrando-se impreterivelmente às 18:00h do mesmo dia' : 'de 24 horas, devendo ser devolvida no mesmo horário do dia seguinte'}.
3. VALORES: Os valores variam conforme o modelo da moto (Biz Antiga: R$35, Biz Nova: R$40, Pop Nova: R$50, Fan 2020: R$80).
4. RESPONSABILIDADE: O LOCATÁRIO é inteiramente responsável por quaisquer danos causados ao veículo, a terceiros ou infrações de trânsito cometidas durante o período de locação.
5. DEVOLUÇÃO: O veículo deve ser devolvido com a mesma quantidade de combustível e nas mesmas condições de conservação em que foi entregue.
6. FORO: Fica eleito o foro da comarca local para dirimir quaisquer dúvidas oriundas deste contrato.
`;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedMoto, setSelectedMoto] = useState<MotoModel | null>(null);
  const [customerData, setCustomerData] = useState<Partial<Customer>>({});
  const [isContractAccepted, setIsContractAccepted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [motoPrices, setMotoPrices] = useState<Record<MotoModel, number>>(MOTO_PRICES);
  const [customRentalPrice, setCustomRentalPrice] = useState<number>(0);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('18h');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('juan_motos_customers');
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        console.error("Error loading customers", e);
      }
    }

    const savedPrices = localStorage.getItem('juan_motos_prices');
    if (savedPrices) {
      try {
        setMotoPrices(JSON.parse(savedPrices));
      } catch (e) {
        console.error("Error loading prices", e);
      }
    }
  }, []);

  // Save customers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('juan_motos_customers', JSON.stringify(customers));
  }, [customers]);

  // Save prices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('juan_motos_prices', JSON.stringify(motoPrices));
  }, [motoPrices]);

  const handleWhatsAppRedirect = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rgInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'rgPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomerData(prev => ({ ...prev, [type]: reader.result as string }));
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = (type: 'photo' | 'rgPhoto') => {
    if (type === 'photo') {
      fileInputRef.current?.click();
    } else {
      rgInputRef.current?.click();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isContractAccepted) {
      alert('Você precisa aceitar o contrato para continuar.');
      return;
    }

    const newCustomer: Customer = {
      name: customerData.name || '',
      rg: customerData.rg || '',
      cpf: customerData.cpf || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      photo: customerData.photo,
      rgPhoto: customerData.rgPhoto,
    };

    // Save to local list
    setCustomers(prev => [...prev, newCustomer]);

    // Generate PDF
    generateContractPDF(newCustomer);

    const message = `*NOVO CADASTRO - JUAN MOTOS*\n\n` +
      `*Nome:* ${newCustomer.name}\n` +
      `*RG:* ${newCustomer.rg}\n` +
      `*CPF:* ${newCustomer.cpf}\n` +
      `*Telefone:* ${newCustomer.phone}\n` +
      `*Endereço:* ${newCustomer.address}\n\n` +
      `_Contrato aceito e PDF gerado._`;
    
    handleWhatsAppRedirect(message);
    setCurrentView('home');
    setCustomerData({});
    setIsContractAccepted(false);
  };

  const deleteCustomer = (cpf: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setCustomers(prev => prev.filter(c => c.cpf !== cpf));
    }
  };

  const selectCustomerForRental = (customer: Customer) => {
    setCustomerData(customer);
    setCurrentView('rent');
  };

  const startRental = (model: MotoModel) => {
    setSelectedMoto(model);
    setCustomRentalPrice(motoPrices[model]);
    setCurrentView('rent');
  };

  const handleRentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoto) return;

    // Generate PDF with custom price
    const tempPrices = { ...MOTO_PRICES, [selectedMoto]: customRentalPrice };
    // Generate PDF Contract for the rental
    generateContractPDF(customerData, selectedMoto, customRentalPrice, rentalPeriod);

    const message = `*ALUGUEL DE MOTO - JUAN MOTOS*\n\n` +
      `*Moto:* ${MOTO_NAMES[selectedMoto]}\n` +
      `*Valor:* R$ ${customRentalPrice},00\n` +
      `*Período:* ${RENTAL_PERIOD_LABELS[rentalPeriod]}\n` +
      `*Cliente:* ${customerData.name || 'Não informado'}\n\n` +
      `_Contrato de locação PDF gerado e vinculado._`;
    handleWhatsAppRedirect(message);
    setCurrentView('home');
  };

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = customerData.cpf || '0,00';
    const desc = customerData.address || 'Aluguel de Moto';

    // Generate PDF
    generateReceiptPDF(customerData.name || 'Cliente', value, desc);

    const message = `*RECIBO - JUAN MOTOS*\n\n` +
      `*Recebemos de:* ${customerData.name}\n` +
      `*A quantia de:* R$ ${value}\n` +
      `*Referente a:* ${desc}\n` +
      `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `_Recibo PDF gerado._`;
    handleWhatsAppRedirect(message);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-red selection:text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-racing-flags pointer-events-none z-0" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-full shadow-2xl mb-4 border-4 border-brand-red"
          >
            <Bike className="w-16 h-16 text-brand-red" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Juan <span className="text-brand-red">Motos</span>
          </h1>
          <p className="text-xs text-brand-silver font-bold tracking-widest uppercase mt-1">
            Aluguel de Motos
          </p>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div 
                key="home"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-4"
              >
                <MenuButton 
                  icon={<UserPlus />} 
                  label="Cadastro de Cliente" 
                  description="Completo com Foto e RG"
                  onClick={() => { setCustomerData({}); setCurrentView('register'); }}
                  color="bg-white text-brand-black"
                />

                <MenuButton 
                  icon={<Users />} 
                  label="Clientes Cadastrados" 
                  description="Ver banco de dados local"
                  onClick={() => setCurrentView('customers_list')}
                  color="bg-brand-silver text-brand-black"
                />

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-silver mb-3 uppercase tracking-widest">
                    <Clock size={12} className="text-brand-red" />
                    <span>Selecione o Período de Aluguel:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['18h', '24h'] as RentalPeriod[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setRentalPeriod(p)}
                        className={cn(
                          "py-2 px-3 rounded-xl font-black uppercase italic text-[10px] transition-all border-2",
                          rentalPeriod === p 
                            ? "bg-brand-red text-white border-brand-red shadow-lg scale-105" 
                            : "bg-white/5 text-brand-silver border-transparent hover:bg-white/10"
                        )}
                      >
                        {RENTAL_PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <RentalButton 
                    model="biz-old" 
                    price={motoPrices['biz-old']}
                    period={rentalPeriod}
                    onClick={() => startRental('biz-old')} 
                  />
                  <RentalButton 
                    model="biz-new" 
                    price={motoPrices['biz-new']}
                    period={rentalPeriod}
                    onClick={() => startRental('biz-new')} 
                  />
                  <RentalButton 
                    model="pop-new" 
                    price={motoPrices['pop-new']}
                    period={rentalPeriod}
                    onClick={() => startRental('pop-new')} 
                  />
                  <RentalButton 
                    model="fan-2020" 
                    price={motoPrices['fan-2020']}
                    period={rentalPeriod}
                    onClick={() => startRental('fan-2020')} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MenuButton 
                    icon={<Receipt />} 
                    label="Recibo" 
                    description="Oficial"
                    onClick={() => setCurrentView('receipt')}
                    color="bg-brand-silver text-brand-black"
                  />
                  <MenuButton 
                    icon={<Settings />} 
                    label="Preços" 
                    description="Ajustar valores"
                    onClick={() => setCurrentView('settings')}
                    color="bg-brand-silver text-brand-black"
                  />
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start gap-3 text-sm text-brand-silver">
                    <MapPin className="w-5 h-5 text-brand-red shrink-0" />
                    <p>{ADDRESS}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-brand-silver mt-3">
                    <Phone className="w-5 h-5 text-brand-red shrink-0" />
                    <p>(92) 99519-7573</p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h2 className="text-2xl font-black uppercase italic mb-6">Ajustar Preços</h2>
                
                <div className="space-y-4">
                  {(Object.keys(motoPrices) as MotoModel[]).map((model) => (
                    <div key={model} className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-brand-black/40 ml-1">{MOTO_NAMES[model]}</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" size={18} />
                        <input 
                          type="number" 
                          value={motoPrices[model]}
                          onChange={e => setMotoPrices({...motoPrices, [model]: Number(e.target.value)})}
                          className="w-full pl-10 pr-4 py-3 bg-brand-silver/30 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    confetti({ particleCount: 50, spread: 40 });
                    setCurrentView('home');
                  }}
                  className="w-full bg-brand-black text-white p-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 shadow-xl mt-8"
                >
                  Salvar Novos Preços <CheckCircle2 size={18} />
                </button>
              </motion.div>
            )}

            {currentView === 'customers_list' && (
              <motion.div 
                key="customers_list"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h2 className="text-2xl font-black uppercase italic mb-6">Banco de Dados</h2>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/30" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou CPF..." 
                    className="w-full pl-10 pr-4 py-3 bg-brand-silver/30 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/20"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {customers.filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.cpf.includes(searchTerm)
                  ).length === 0 ? (
                    <div className="text-center py-8 text-brand-black/40 font-bold uppercase text-xs italic">
                      Nenhum cliente encontrado
                    </div>
                  ) : (
                    customers.filter(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.cpf.includes(searchTerm)
                    ).map((customer, idx) => (
                      <div key={idx} className="p-4 bg-brand-silver/20 rounded-2xl border border-brand-silver/50 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red overflow-hidden">
                            {customer.photo ? (
                              <img src={customer.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <UserPlus size={20} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase italic leading-none">{customer.name}</h4>
                            <p className="text-[10px] font-bold text-brand-black/50 mt-1">CPF: {customer.cpf}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => generateContractPDF(customer)}
                            className="p-2 bg-brand-silver text-brand-black/60 rounded-lg hover:bg-brand-red hover:text-white transition-all"
                            title="Gerar Contrato PDF"
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                            onClick={() => selectCustomerForRental(customer)}
                            className="p-2 bg-brand-red text-white rounded-lg shadow-md hover:scale-110 transition-transform"
                            title="Alugar para este cliente"
                          >
                            <Bike size={16} />
                          </button>
                          <button 
                            onClick={() => deleteCustomer(customer.cpf)}
                            className="p-2 bg-brand-silver text-brand-black/40 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {currentView === 'register' && (
              <motion.div 
                key="register"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h2 className="text-2xl font-black uppercase italic mb-6">Cadastro de Cliente</h2>
                
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Hidden Inputs for Camera */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    capture="user" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'photo')} 
                  />
                  <input 
                    type="file" 
                    ref={rgInputRef} 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'rgPhoto')} 
                  />

                  <Input label="Nome Completo" placeholder="Ex: João Silva" onChange={e => setCustomerData({...customerData, name: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="RG" placeholder="000.000.000" onChange={e => setCustomerData({...customerData, rg: e.target.value})} required />
                    <Input label="CPF" placeholder="000.000.000-00" onChange={e => setCustomerData({...customerData, cpf: e.target.value})} required />
                  </div>
                  <Input label="Telefone" placeholder="(92) 99999-9999" onChange={e => setCustomerData({...customerData, phone: e.target.value})} required />
                  <Input label="Endereço" placeholder="Rua, Número, Bairro" onChange={e => setCustomerData({...customerData, address: e.target.value})} required />
                  
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <PhotoButton label="Foto do Cliente" active={!!customerData.photo} photoUrl={customerData.photo} onClick={() => capturePhoto('photo')} />
                    <PhotoButton label="Foto do RG" active={!!customerData.rgPhoto} photoUrl={customerData.rgPhoto} onClick={() => capturePhoto('rgPhoto')} />
                  </div>

                  <div className="p-4 bg-brand-silver/50 rounded-xl border border-brand-black/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-brand-red">
                        <ShieldCheck size={18} />
                        <span className="text-xs font-bold uppercase">Contrato de Locação</span>
                      </div>
                      <button type="button" onClick={() => setCurrentView('contract')} className="text-[10px] font-bold text-brand-red underline">Ver Completo</button>
                    </div>
                    <p className="text-[10px] leading-tight text-brand-black/70">
                      Ao prosseguir, você concorda com os termos de uso e responsabilidade sobre o veículo locado, comprometendo-se a devolver o mesmo nas condições originais até as 18h do dia corrente.
                    </p>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input type="checkbox" checked={isContractAccepted} onChange={e => setIsContractAccepted(e.target.checked)} className="accent-brand-red" />
                      <span className="text-xs font-bold">Aceito os termos do contrato</span>
                    </label>
                  </div>

                  <SubmitButton label="Finalizar Cadastro" icon={<Send size={18} />} />
                </form>
              </motion.div>
            )}

            {currentView === 'contract' && (
              <motion.div 
                key="contract"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('register')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar ao Cadastro
                </button>
                <h2 className="text-xl font-black uppercase italic mb-4">Contrato de Locação</h2>
                <div className="bg-brand-silver/30 p-4 rounded-xl text-[10px] font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {getContractText(rentalPeriod)}
                </div>
                <button 
                  onClick={() => { setIsContractAccepted(true); setCurrentView('register'); }}
                  className="w-full bg-brand-red text-white p-4 rounded-2xl font-black uppercase italic mt-6 shadow-xl"
                >
                  Aceitar e Voltar
                </button>
              </motion.div>
            )}

            {currentView === 'rent' && (
              <motion.div 
                key="rent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-brand-red text-white rounded-2xl">
                    <Bike size={24} />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black uppercase italic leading-none">Alugar Moto</h2>
                    <button 
                      type="button"
                      onClick={() => setCurrentView('customers_list')}
                      className="text-[10px] font-bold text-brand-red underline uppercase"
                    >
                      Selecionar Cliente Salvo
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRentalSubmit} className="space-y-4">
                  <div className="p-4 bg-brand-red/5 rounded-2xl border-2 border-brand-red/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold uppercase opacity-60">Valor da Diária</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-brand-red">R$</span>
                        <input 
                          type="number" 
                          value={customRentalPrice}
                          onChange={e => setCustomRentalPrice(Number(e.target.value))}
                          className="w-20 bg-transparent border-b-2 border-brand-red text-2xl font-black text-brand-red outline-none text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-black/60 mb-4">
                      <Clock size={14} />
                      <span>Selecione o Período:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {(['18h', '24h'] as RentalPeriod[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setRentalPeriod(p)}
                          className={cn(
                            "py-3 px-4 rounded-xl font-black uppercase italic text-[10px] transition-all border-2",
                            rentalPeriod === p 
                              ? "bg-brand-red text-white border-brand-red shadow-lg" 
                              : "bg-brand-silver/20 text-brand-black/40 border-transparent"
                          )}
                        >
                          {RENTAL_PERIOD_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input 
                    label="Nome do Cliente" 
                    placeholder="Nome completo" 
                    value={customerData.name || ''}
                    onChange={e => setCustomerData({...customerData, name: e.target.value})} 
                    required 
                  />
                  
                  <div className="p-4 bg-brand-silver/50 rounded-xl border border-brand-black/10">
                    <p className="text-[10px] leading-tight text-brand-black/70 italic">
                      * O contrato de locação será vinculado automaticamente a este pedido. O locatário declara estar ciente das multas e responsabilidades civis e criminais.
                    </p>
                  </div>

                  <SubmitButton label="Confirmar Aluguel" icon={<CheckCircle2 size={18} />} />
                </form>
              </motion.div>
            )}

            {currentView === 'receipt' && (
              <motion.div 
                key="receipt"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="bg-white text-brand-black rounded-3xl p-6 shadow-2xl"
              >
                <button onClick={() => setCurrentView('home')} className="mb-6 flex items-center gap-2 text-brand-red font-bold">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h2 className="text-2xl font-black uppercase italic mb-6">Recibo Oficial</h2>
                
                <form onSubmit={handleReceiptSubmit} className="space-y-4">
                  <Input label="Recebemos de" placeholder="Nome do cliente" value={customerData.name || ''} onChange={e => setCustomerData({...customerData, name: e.target.value})} required />
                  <Input label="Valor (R$)" placeholder="Ex: 50,00" value={customerData.cpf || ''} onChange={e => setCustomerData({...customerData, cpf: e.target.value})} required />
                  <Input label="Referente a" placeholder="Ex: Aluguel de Moto Biz" value={customerData.address || ''} onChange={e => setCustomerData({...customerData, address: e.target.value})} required />
                  
                  <div className="p-8 border-2 border-dashed border-brand-silver rounded-2xl text-center">
                    <Receipt className="w-12 h-12 text-brand-silver mx-auto mb-2" />
                    <p className="text-xs font-bold text-brand-silver uppercase">Visualização do Recibo</p>
                  </div>

                  <SubmitButton label="Gerar PDF e Enviar WhatsApp" icon={<Send size={18} />} />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center text-[10px] text-brand-silver/50 uppercase tracking-[0.2em] font-bold">
          &copy; 2026 Juan Motos - Todos os direitos reservados
        </footer>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, description, onClick, color }: { icon: React.ReactNode, label: string, description: string, onClick: () => void, color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-5 rounded-3xl shadow-xl text-left transition-all",
        color
      )}
    >
      <div className="p-3 bg-brand-red text-white rounded-2xl shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-black uppercase italic leading-none">{label}</h3>
        <p className="text-xs font-bold opacity-60 mt-1">{description}</p>
      </div>
    </motion.button>
  );
}

function RentalButton({ model, price, period, onClick }: { model: MotoModel, price: number, period: RentalPeriod, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-brand-red text-white p-5 rounded-3xl shadow-xl text-left flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white text-brand-red rounded-2xl group-hover:rotate-12 transition-transform">
          <Bike size={24} />
        </div>
        <div>
          <h3 className="font-black uppercase italic leading-none">{MOTO_NAMES[model]}</h3>
          <p className="text-xs font-bold opacity-80 mt-1">{RENTAL_PERIOD_LABELS[period]}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-black italic">R$ {price}</span>
      </div>
    </motion.button>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-brand-black/40 ml-1">{label}</label>
      <input 
        {...props} 
        className="w-full bg-brand-silver/30 border-2 border-transparent focus:border-brand-red focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-sm"
      />
    </div>
  );
}

function PhotoButton({ label, active, photoUrl, onClick }: { label: string, active: boolean, photoUrl?: string, onClick: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all relative overflow-hidden h-32",
        active ? "bg-green-50 border-green-500 text-green-600" : "bg-brand-silver/30 border-brand-silver text-brand-black/40"
      )}
    >
      {active && photoUrl ? (
        <img src={photoUrl} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-50" />
      ) : null}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {active ? <CheckCircle2 size={24} /> : <Camera size={24} />}
        <span className="text-[10px] font-black uppercase text-center">{label}</span>
      </div>
    </button>
  );
}

function SubmitButton({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      className="w-full bg-brand-black text-white p-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 shadow-xl mt-4"
    >
      {label} {icon}
    </motion.button>
  );
}
