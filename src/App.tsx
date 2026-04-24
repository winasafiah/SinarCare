/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  MessageCircle,
  Navigation,
  AlertCircle,
  Home,
  Bell,
  User,
  Send,
  Loader2,
  Trash2,
  Calendar,
  Share2,
  Watch,
  Smartphone,
  RefreshCw,
  MoreVertical,
  LogOut,
  Save,
  Copy,
  FileText,
  Pencil,
  CalendarPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import {
  View,
  VitalRecord,
  Medication,
  ChatMessage,
  Appointment,
  UserProfile,
  PatientData
} from './types';

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', title: 'Heart Checkup', doctor: 'Dr. Smith', date: 'June 20, 2024', time: '10:00 AM', location: 'City Clinic' }
];

const INITIAL_MEDS: Medication[] = [
  { id: '1', name: 'Metformin', dosage: '500mg', time: '08:00', taken: false },
  { id: '2', name: 'Amlodipine', dosage: '5mg', time: '20:00', taken: false },
  { id: '3', name: 'Multivitamins', dosage: '1 pill', time: '09:00', taken: false },
];

const MOCK_PATIENTS: PatientData[] = [
  {
    id: '1',
    profile: { name: 'Grandma Betty', age: '75', emergencyContact: '123-456', allergies: 'None', notificationsEnabled: true },
    meds: INITIAL_MEDS,
    vitals: [
      { id: '101', type: 'Heart Rate', value: '72', unit: 'bpm', timestamp: Date.now() - 3600000, source: 'watch' },
      { id: '102', type: 'Steps', value: '3,842', unit: 'steps', timestamp: Date.now() - 7200000, source: 'watch' }
    ],
    appointments: INITIAL_APPOINTMENTS,
    chatHistory: []
  },
  {
    id: '2',
    profile: { name: 'Grandpa Joe', age: '82', emergencyContact: '987-654', allergies: 'Ibuprofen', notificationsEnabled: true },
    meds: [
      { id: '4', name: 'Insulin', dosage: '10 units', time: '07:30', taken: true }
    ],
    vitals: [
      { id: '201', type: 'Heart Rate', value: '68', unit: 'bpm', timestamp: Date.now() - 5000000, source: 'watch' }
    ],
    appointments: [
      { id: '3', title: 'Eye Exam', doctor: 'Dr. Vision', date: 'July 12, 2024', time: '02:00 PM', location: 'Optical Center' }
    ],
    chatHistory: []
  }
];

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-2xl transition-colors ${active ? 'text-sinar-primary bg-sky-50' : 'text-slate-400'}`}
    >
      {icon}
      <span className="text-xs font-bold mt-1 uppercase tracking-wider">{label}</span>
    </button>
  );
}

// Sub-components
function ProfileView({ profile, onUpdate, onBack }: { profile: UserProfile, onUpdate: (p: UserProfile) => void, onBack: () => void }) {
  const [formData, setFormData] = useState(profile);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[100] bg-sinar-bg flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-sinar-primary">
            <Home size={24} />
          </button>
          <h2 className="text-xl font-bold">Health Profile</h2>
        </div>
        <button
          onClick={() => { onUpdate(formData); onBack(); }}
          className="p-3 bg-sinar-primary text-white rounded-2xl shadow-sm"
        >
          <Save size={24} />
        </button>
      </header>

      <div className="flex-1 h-full max-h-full overflow-y-auto p-4 space-y-6 no-scrollbar"> {/*profile*/}
        <div className="card-sinar space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-50 p-4 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sinar-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="bg-slate-50 p-4 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sinar-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="bg-slate-50 p-4 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sinar-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medication Allergies</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="bg-slate-50 p-4 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sinar-primary h-24"
            />
          </div>
        </div>

        <div className="card-sinar flex items-center justify-between p-6">
          <div>
            <h3 className="font-bold">Reminders</h3>
            <p className="text-sm text-slate-400">Get alerts before medications</p>
          </div>
          <button
            onClick={() => setFormData({ ...formData, notificationsEnabled: !formData.notificationsEnabled })}
            className={`w-14 h-8 rounded-full transition-colors relative ${formData.notificationsEnabled ? 'bg-sinar-primary' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.notificationsEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Doctor's Communication</h3>
          <div className="card-sinar bg-sinar-secondary/20 border-sinar-primary/30 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sinar-primary/20 rounded-2xl flex items-center justify-center text-sinar-primary">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Medical Report</h3>
                <p className="text-sm text-slate-500">Share your status with your doctor</p>
              </div>
            </div>

            <button
              onClick={() => (window as any).copyMedicalReport?.()}
              className="w-full py-4 bg-white border-2 border-sinar-primary text-sinar-primary font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-sm"
            >
              <Copy size={20} />
              Copy Report to Clipboard
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">Click above to copy a detailed summary of your health data, then paste it in an email or message to your doctor.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Caregiver & Privacy</h3>
          <div className="card-sinar bg-slate-900 border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Caregiver Mode</h3>
                <p className="text-sm text-slate-400">Manage multiple patients simultaneously</p>
              </div>
              <button
                onClick={() => (window as any).toggleCaregiverMode?.()}
                className={`w-14 h-8 rounded-full transition-colors relative ${(window as any).isCaregiverMode ? 'bg-sinar-primary' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${(window as any).isCaregiverMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {(window as any).isCaregiverMode && (
              <button
                onClick={() => (window as any).goToCaregiverDashboard?.()}
                className="w-full py-4 bg-sinar-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-sm active:scale-95 transition-transform"
              >
                Go To Caregiver Dashboard
              </button>
            )}
          </div>
        </section>

        <button className="w-full p-6 rounded-[24px] bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 border border-red-100 mb-4">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </motion.div>
  );
}

function HealthCompanion({ onBack, history, onUpdateHistory, vitals, meds, compact }: { onBack: () => void, history: ChatMessage[], onUpdateHistory: (h: ChatMessage[]) => void, vitals: VitalRecord[], meds: Medication[], compact?: boolean }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const vitalsSummary = vitals.length > 0
        ? `Last vitals: ${vitals[0].type} was ${vitals[0].value}${vitals[0].unit}.`
        : "No vitals recorded yet.";

      const medsSummary = meds.length > 0
        ? `Current medications: ${meds.map(m => m.name).join(', ')}.`
        : "No medications listed.";

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are 'Sinar', a very friendly and warm health companion for Grandma. 
          Use a cheerful, encouraging, and patient tone. 
          STRICTRULE: Your replies MUST be short (max 3 sentences) and use simple words. 
          Provide direct, simple solutions for health questions.
          
          ALWAYS follow up by asking more about their symptoms (e.g., 'Does it hurt more when you move?', 'How long have you felt this way?').
          
          USER HEALTH CONTEXT:
          - ${vitalsSummary}
          - ${medsSummary}
          - ALLERGIES: No known medication allergies.
          
          Avoid urging the use of the SOS button unless they describe severe symptoms like chest pain or extreme breathing difficulty.`
        },
        contents: newHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text ?? "I'm listening, tell me more.",
        timestamp: Date.now()
      };

      onUpdateHistory([...newHistory, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : 'h-[75vh]'}`}>
      {!compact && (
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-sinar-primary">
            <Home size={32} />
          </button>
          <h2 className="text-3xl font-bold">Health Talk</h2>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-2 ${compact ? 'px-3 mt-4' : ''}`}
      >
        {history.length === 0 && (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-sinar-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <MessageCircle size={40} className="text-white" />
            </div>
            <p className="text-slate-500 text-lg italic">"Hello! I am Sinar. How are you feeling today?"</p>
          </div>
        )}

        {history.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${compact ? 'max-w-[90%] p-3 text-sm' : 'max-w-[85%] p-4 text-lg'} rounded-2xl ${msg.role === 'user'
              ? 'bg-sinar-primary text-white rounded-tr-none'
              : 'bg-slate-50 border border-slate-100 shadow-sm rounded-tl-none text-slate-800'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-sinar-primary" size={20} />
              <span className="text-slate-400">Sinar is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`${compact ? 'p-3' : 'mt-4'} flex gap-2 shrink-0 border-t border-gray-50`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="I have a headache..."
          className={`flex-1 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sinar-primary ${compact ? 'p-3 text-sm' : 'p-5 text-lg'}`}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className={`bg-sinar-primary text-white rounded-2xl shadow-sm disabled:opacity-50 ${compact ? 'p-3' : 'p-5'}`}
        >
          <Send size={compact ? 18 : 24} />
        </button>
      </div>
    </div>
  );
}

function VitalsLogger({ onBack, onAdd }: { onBack: () => void, onAdd: (type: VitalRecord['type'], val: string) => void }) {
  const [selectedType, setSelectedType] = useState<VitalRecord['type'] | null>(null);
  const [value, setValue] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-sinar-primary">
          <Home size={32} />
        </button>
        <h2 className="text-3xl font-bold">Record Vitals</h2>
      </div>

      {!selectedType ? (
        <div className="grid grid-cols-1 gap-4">
          <VitalTypeButton
            type="Blood Pressure"
            icon={<Activity size={32} />}
            color="bg-red-50 text-red-500"
            onClick={() => setSelectedType('Blood Pressure')}
          />
          <VitalTypeButton
            type="Heart Rate"
            icon={<Heart size={32} />}
            color="bg-pink-50 text-pink-500"
            onClick={() => setSelectedType('Heart Rate')}
          />
          <VitalTypeButton
            type="Blood Sugar"
            icon={<Bell size={32} />}
            color="bg-amber-50 text-amber-500"
            onClick={() => setSelectedType('Blood Sugar')}
          />
          <VitalTypeButton
            type="Weight"
            icon={<User size={32} />}
            color="bg-emerald-50 text-emerald-500"
            onClick={() => setSelectedType('Weight')}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card-sinar text-center space-y-4 py-12">
            <h3 className="text-2xl font-bold">{selectedType}</h3>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="w-32 text-6xl font-black text-center border-b-4 border-sinar-primary focus:outline-none bg-transparent"
              />
              <span className="text-2xl font-bold text-slate-300 mt-6">
                {selectedType === 'Blood Pressure' ? 'mmHg' : selectedType === 'Heart Rate' ? 'bpm' : selectedType === 'Blood Sugar' ? 'mg/dL' : 'kg'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedType(null)}
              className="flex-1 p-6 rounded-3xl bg-slate-100 font-bold text-lg"
            >
              Back
            </button>
            <button
              onClick={() => onAdd(selectedType, value)}
              disabled={!value}
              className="flex-1 p-6 rounded-3xl bg-sinar-primary text-sky-900 font-bold text-lg shadow-sm disabled:opacity-50"
            >
              Save Record
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function VitalTypeButton({ type, icon, color, onClick }: { type: string, icon: any, color: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-sinar flex items-center gap-6 text-left active:scale-[0.98]"
    >
      <div className={`p-5 rounded-3xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{type}</p>
        <p className="text-slate-400">Tap to record</p>
      </div>
    </button>
  );
}

function MedicationTracker({
  meds,
  onToggle,
  onBack,
  onAddMed,
  showAddMed,
  onDeleteMed,
  setShowAddMed,
  newMed,
  setNewMed
}: {
  meds: Medication[],
  onToggle: (id: string | number) => void,
  onBack: () => void,
  onAddMed: () => void,
  onDeleteMed: (id: string) => void,
  showAddMed: boolean,
  setShowAddMed: (v: boolean) => void,
  newMed: any,
  setNewMed: (v: any) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-sinar-primary">
            <Home size={32} />
          </button>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Today's Meds</h2>
        </div>
        <button
          onClick={() => setShowAddMed(true)}
          className="w-14 h-14 bg-sinar-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>
      <div className="p-3 bg-sinar-secondary rounded-2xl text-amber-900 font-bold text-center">
        {meds.filter(m => m.taken).length} / {meds.length} Medications Taken
      </div>

      <div className="space-y-4">
        {meds.map(med => (
          <div
            key={med.id}
            className={`w-full sinar-card flex items-center justify-between group ${med.taken ? 'bg-emerald-50 border-emerald-100' : ''}`}
          >
            <button onClick={() => onToggle(med.id)} className="flex items-center gap-4 text-left flex-1">
              <div className={`p-4 rounded-2xl ${med.taken ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                {med.taken ? <CheckCircle2 size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <p className={`text-xl font-bold ${med.taken ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>{med.name}</p>
                <p className="text-slate-500 font-medium">{med.dosage} • {med.time}</p>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={(e) => { e.stopPropagation(); onDeleteMed(med.id); }} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-400 transition-colors active:scale-90">
                <Trash2 size={20} />
              </button>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${med.taken ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 group-hover:border-sinar-primary'}`}>
                <CheckCircle2 size={24} className={med.taken ? 'block' : 'opacity-0'} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sinar-card bg-sky-50 border-sky-100 flex gap-4 p-5">
        <Bell size={24} className="text-sinar-primary shrink-0" />
        <p className="text-sky-900 font-medium leading-relaxed">
          Make sure to take your medicine with a glass of warm water.
        </p>
      </div>
      <AnimatePresence>
        {showAddMed && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-4 bottom-10 top-auto bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-[32px] border border-slate-100 p-6 z-[120] space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Add New Medication</h3>
              <button onClick={() => setShowAddMed(false)} className="text-slate-300"><Plus size={24} className="rotate-45" /></button>
            </div>
            <input
              type="text"
              placeholder="Medication Name (e.g. Aspirin)"
              value={newMed.name}
              onChange={e => setNewMed({ ...newMed, name: e.target.value })}
              className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 placeholder:opacity-50 font-bold"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Dosage (e.g. 500mg)"
                value={newMed.dosage}
                onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
              />
              <input
                type="time"
                value={newMed.time}
                onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
              />
            </div>
            <button
              onClick={onAddMed}
              className="w-full py-5 bg-sinar-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Add Medication
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CaregiverDashboard({ patients, onSelectPatient, onToggleMode }: { patients: PatientData[], onSelectPatient: (id: string | null) => void, onToggleMode: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col p-6 space-y-8 overflow-y-auto no-scrollbar pb-32"
    >
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Caregiver Dashboard</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing {patients.length} Elderly Users</p>
        </div>
        <button
          onClick={onToggleMode}
          className="p-3 bg-slate-100 rounded-2xl text-slate-500 active:scale-90 transition-transform"
        >
          <LogOut size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {patients.map(patient => {
          const medsTaken = patient.meds.filter(m => m.taken).length;
          const totalMeds = patient.meds.length;
          const lastHeartRate = patient.vitals.find(v => v.type === 'Heart Rate')?.value || '--';

          return (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="card-sinar bg-white border-2 border-slate-100 shadow-sm text-left flex flex-col gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sinar-primary/10 rounded-full flex items-center justify-center text-sinar-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-slate-800">{patient.profile.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.profile.age} Years Old</p>
                  </div>
                </div>
                <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 text-[10px] font-black uppercase">Active</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Meds Status</p>
                  <p className="text-lg font-black text-slate-700">{medsTaken}/{totalMeds} TAKEN</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Heart Rate</p>
                  <p className="text-lg font-black text-sinar-primary">{lastHeartRate} BPM</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <span className="text-[10px] font-black text-sinar-primary uppercase tracking-widest flex items-center gap-2">
                  View Detail <Send size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>


    </motion.div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const [patients, setPatients] = useState<PatientData[]>(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [profile, setProfile] = useState<UserProfile>(MOCK_PATIENTS[0].profile);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isWatchConnected, setIsWatchConnected] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize active states with selected patient
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCaregiverMode && selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        setVitals(patient.vitals);
        setMeds(patient.meds);
        setProfile(patient.profile);
        setChatHistory(patient.chatHistory);
        setAppointments(patient.appointments);
        setCurrentView('home');
      }
    } else if (!isCaregiverMode) {
      // Default initial or single user mode
      // Initial states are already set or loaded via effect below
    }
  }, [selectedPatientId, isCaregiverMode]);

  // Sync back to patients array
  useEffect(() => {
    if (isCaregiverMode && selectedPatientId) {
      setPatients(prev => prev.map(p =>
        p.id === selectedPatientId
          ? { ...p, profile, meds, vitals, appointments, chatHistory }
          : p
      ));
    }
  }, [profile, meds, vitals, appointments, chatHistory, selectedPatientId, isCaregiverMode]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [newAppt, setNewAppt] = useState({ title: '', doctor: '', location: '', date: '', time: '' });
  const [showApptReminder, setShowApptReminder] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '08:00' });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [showDeleteMedConfirm, setShowDeleteMedConfirm] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingFeedback, setShowFeelingFeedback] = useState(false);
  const sosTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  // SOS Sound Effect
  useEffect(() => {
    if (showSOS) {
      if (!sirenRef.current) {
        sirenRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        sirenRef.current.loop = true;
      }
      sirenRef.current.play().catch(e => console.log("Audio play blocked", e));
    } else {
      if (sirenRef.current) {
        sirenRef.current.pause();
        sirenRef.current.currentTime = 0;
      }
    }
  }, [showSOS]);

  const startSOS = () => {
    // Immediate feedback sound
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    clickSound.play().catch(() => { });

    let progress = 0;
    setSosProgress(0);
    sosTimerRef.current = setInterval(() => {
      progress += 5;
      setSosProgress(progress);
      if (progress >= 100) {
        setShowSOS(true);
        if (sosTimerRef.current) clearInterval(sosTimerRef.current);
      }
    }, 50);
  };

  const cancelSOS = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    setSosProgress(0);
  };

  const syncWatch = () => {
    setIsSyncing(true);
    // Simulate Bluetooth/NFC scan and sync
    setTimeout(() => {
      const newVitals: VitalRecord[] = [
        {
          id: Date.now().toString(),
          type: 'Heart Rate',
          value: (72 + Math.floor(Math.random() * 10)).toString(),
          unit: 'bpm',
          timestamp: Date.now(),
          source: 'watch'
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'Blood Pressure',
          value: '120/80',
          unit: 'mmHg',
          timestamp: Date.now(),
          source: 'watch'
        }
      ];
      setVitals(prev => [...newVitals, ...prev]);
      setIsSyncing(false);

      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#89CFF0']
      });
    }, 2000);
  };

  const addAppointment = () => {
    if (!newAppt.title || !newAppt.date) return;

    if (editingApptId) {
      setAppointments(appointments.map(a =>
        a.id === editingApptId ? { ...a, ...newAppt } : a
      ));
    } else {
      const appt: Appointment = {
        id: Date.now().toString(),
        ...newAppt,
      };
      setAppointments([...appointments, appt]);
    }

    setNewAppt({ title: '', doctor: '', location: '', date: '', time: '' });
    setShowAddAppointment(false);
    setEditingApptId(null);
  };

  const handleEditAppt = (appt: Appointment) => {
    setNewAppt({
      title: appt.title,
      doctor: appt.doctor || '',
      location: appt.location || '',
      date: appt.date,
      time: appt.time
    });
    setEditingApptId(appt.id);
    setShowAddAppointment(true);
  };

  const handleDeleteAppt = (id: string) => {
    setAppointmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAppt = () => {
    if (appointmentToDelete) {
      setAppointments(appointments.filter(a => a.id !== appointmentToDelete));
      setAppointmentToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDeleteAppt = () => {
    setAppointmentToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeleteChatHistory = () => {
    setChatHistory([]);
    setShowDeleteChatConfirm(false);
  };

  const cancelDeleteChatHistory = () => {
    setShowDeleteChatConfirm(false);
  };

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) return;
    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
      taken: false
    };
    setMeds([...meds, medication]);
    setNewMed({ name: '', dosage: '', time: '08:00' });
    setShowAddMed(false);
  };

  const deleteMedication = (id: string) => {
    setMedicationToDelete(id);
    setShowDeleteMedConfirm(true);
  };

  const confirmDeleteMed = () => {
    if (medicationToDelete) {
      setMeds(meds.filter(m => m.id !== medicationToDelete));
      setMedicationToDelete(null);
    }
    setShowDeleteMedConfirm(false);
  };

  const cancelDeleteMed = () => {
    setMedicationToDelete(null);
    setShowDeleteMedConfirm(false);
  };

  // Persistence
  useEffect(() => {
    const savedVitals = localStorage.getItem('sinarcare_vitals');
    const savedMeds = localStorage.getItem('sinarcare_meds');
    const savedChat = localStorage.getItem('sinarcare_chat');
    const savedProfile = localStorage.getItem('sinarcare_profile');

    if (savedVitals) setVitals(JSON.parse(savedVitals));
    if (savedMeds) setMeds(JSON.parse(savedMeds));
    if (savedChat) setChatHistory(JSON.parse(savedChat));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('sinarcare_profile', JSON.stringify(profile));
  }, [profile]);

  // Reminders Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      console.log('Notification:', title, body);
      // Fallback for demo
      alert(`${title}: ${body}`);
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const addVital = (type: VitalRecord['type'], value: string) => {
    const unitMap = {
      'Blood Pressure': 'mmHg',
      'Heart Rate': 'bpm',
      'Blood Sugar': 'mg/dL',
      'Weight': 'kg'
    };

    const newRecord: VitalRecord = {
      id: Date.now().toString(),
      type,
      value,
      unit: unitMap[type],
      timestamp: Date.now()
    };

    setVitals([newRecord, ...vitals]);
    setCurrentView('home');
  };

  const toggleMed = (id: string | number) => {
    const medToToggle = meds.find(m => m.id === id);
    if (!medToToggle) return;

    // If we're marking as taken (it was false, now true)
    const isNowTaken = !medToToggle.taken;

    const newMeds = meds.map(m => m.id === id ? { ...m, taken: isNowTaken } : m);
    setMeds(newMeds);

    // If all are done AND we just marked one as taken, celebrate
    if (isNowTaken && newMeds.every(m => m.taken)) {
      // Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#f59e0b', '#10b981']
      });

      // Ta-da sound
      const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      winSound.volume = 0.5;
      winSound.play().catch(() => { });
    } else if (isNowTaken) {
      // Small feedback sound for individual med check
      const checkSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      checkSound.volume = 0.3;
      checkSound.play().catch(() => { });
    }
  };

  const clearVitals = () => {
    if (confirm('Clear all health records?')) {
      setVitals([]);
    }
  };

  const generateMedicalReport = () => {
    const vitalsStr = vitals.map(v => `- ${v.type}: ${v.value}${v.unit} (${new Date(v.timestamp).toLocaleString()})`).join('\n');
    const medsStr = meds.map(m => `- ${m.name}: ${m.taken ? 'Taken' : 'Pending'} (${m.dosage}, ${m.time})`).join('\n');

    return `SINARCARE MEDICAL REPORT\n` +
      `Patient: ${profile.name} (Age: ${profile.age})\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `VITALS SUMMARY:\n${vitalsStr || 'No vital records recorded today.'}\n\n` +
      `MEDICATION ADHERENCE:\n${medsStr}\n\n` +
      `EMERGENCY CONTACT: ${profile.emergencyContact}\n` +
      `ALLERGIES: ${profile.allergies}`;
  };

  const copyReport = () => {
    const report = generateMedicalReport();
    navigator.clipboard.writeText(report);
    alert('Medical report copied to clipboard! You can now paste it in an email to your doctor.');
  };

  // Expose to sub-components
  useEffect(() => {
    (window as any).copyMedicalReport = copyReport;
    (window as any).toggleCaregiverMode = () => setIsCaregiverMode(!isCaregiverMode);
    (window as any).isCaregiverMode = isCaregiverMode;
    (window as any).goToCaregiverDashboard = () => {
      setSelectedPatientId(null);
      setCurrentView('caregiver');
    };
    return () => {
      delete (window as any).copyMedicalReport;
      delete (window as any).toggleCaregiverMode;
      delete (window as any).isCaregiverMode;
      delete (window as any).goToCaregiverDashboard;
    };
  }, [vitals, meds, profile, isCaregiverMode]);

  // Derived state: next appointment
  const sortedAppts = [...appointments]
    .map(a => {
      const dateStr = a.date.includes('T') || a.date.includes(' ') || a.date.includes(',') ? a.date : a.date + 'T00:00:00';
      return { ...a, parsedDate: new Date(dateStr).getTime() };
    })
    .filter(a => !isNaN(a.parsedDate))
    .sort((a, b) => a.parsedDate - b.parsedDate);

  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);
  const futureAppts = sortedAppts.filter(a => a.parsedDate >= todayAtMidnight.getTime());
  const nextAppt = futureAppts[0];

  useEffect(() => {
    // Automatically delete appointments that have passed
    if (appointments.length !== futureAppts.length) {
      setAppointments(futureAppts.map(({ parsedDate, ...rest }) => rest as Appointment));
    }
  }, [appointments, futureAppts]);

  let nextApptDays = -1;
  let nextApptDateStr = 'No upcoming';
  if (nextAppt) {
    const timeDiff = nextAppt.parsedDate - todayAtMidnight.getTime();
    nextApptDays = Math.round(timeDiff / (1000 * 3600 * 24));
    const d = new Date(nextAppt.parsedDate);
    nextApptDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  useEffect(() => {
    if (nextApptDays === 0 && nextAppt && !localStorage.getItem(`notified_${nextAppt.id}`)) {
      setShowApptReminder(true);
    }
  }, [nextApptDays, nextAppt]);

  const dismissApptReminder = () => {
    if (nextAppt) {
      localStorage.setItem(`notified_${nextAppt.id}`, 'true');
    }
    setShowApptReminder(false);
  };

  const isPastDate = newAppt.date ? new Date((newAppt.date.includes('T') || newAppt.date.includes(' ') || newAppt.date.includes(',')) ? newAppt.date : newAppt.date + 'T00:00:00').getTime() < todayAtMidnight.getTime() : false;
  const isSaveApptDisabled = !newAppt.title || !newAppt.date || isPastDate;

  const addToGoogleCalendar = (appt: Appointment) => {
    const dateObj = new Date(appt.date);
    let datesParam = '';

    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const startDate = `${year}${month}${day}`;

      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDate = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;

      datesParam = `&dates=${startDate}/${endDate}`;
    }

    const text = encodeURIComponent(appt.title);
    const details = encodeURIComponent(`Doctor: ${appt.doctor || 'N/A'}`);
    const location = encodeURIComponent(appt.location || '');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}${datesParam}`;
    window.open(url, '_blank');
  };

  const getNextAppointment = () => {
    if (appointments.length === 0) return null;

    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const now = new Date();
    const futureAppointments = sortedAppointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= now;
    });

    return futureAppointments[0] || sortedAppointments[0];
  };

  const getDaysUntilNextAppointment = () => {
    const nextAppt = getNextAppointment();
    if (!nextAppt) return 'No';

    const today = new Date();
    const apptDate = new Date(nextAppt.date);
    const diffTime = apptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (showSplash) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center sm:p-8">
        <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] relative flex flex-col items-center justify-center bg-[#89CFF0] overflow-hidden pt-4 pb-28 space-y-4 px-4 sm:rounded-[40px] sm:border-[8px] border-slate-800 sm:shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center"
          >
            <img src="/logo.png" alt="SinarCare Logo" className="w-40 h-40 object-contain mb-6 drop-shadow-xl" />
            <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">SinarCare</h1>
            <p className="text-sm font-bold text-white/90 tracking-wider text-center max-w-[200px]"><i>Assistance for Our Loved Ones</i></p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center sm:p-8">
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] relative flex flex-col bg-sinar-bg overflow-hidden pt-4 pb-28 space-y-4 px-4 sm:rounded-[40px] sm:border-[8px] border-slate-800 sm:shadow-2xl">
        <div className="flex-1">
          {(!isCaregiverMode || (isCaregiverMode && !!selectedPatientId)) && (
            <div className="px-2 pt-2 pb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                    Sinar<span className="text-sinar-primary">Care</span>
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {isCaregiverMode && selectedPatientId
                      ? `Viewing: ${profile.name}`
                      : 'Your Health Companion'}
                  </p>
                </div>
                <div className="text-right">

                </div>
              </div>
            </div>
          )}
          {isCaregiverMode && currentView === 'caregiver' ? (
            <CaregiverDashboard
              patients={patients}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setCurrentView('home');
              }}
              onToggleMode={() => setIsCaregiverMode(false)} />
          ) : (
            <>
              {/* Top Section: SOS | Next Appointment */}
              <div className="grid grid-cols-2 gap-2 shrink-0 mt-[-6px] mb-1">
                <div className="card-sinar flex flex-col items-center justify-between text-center min-h-[160px] py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-widest mt-2">Emergency</h3>
                  <button
                    onPointerDown={startSOS}
                    onPointerUp={cancelSOS}
                    onPointerLeave={cancelSOS}
                    className="w-22 h-22 bg-sinar-danger rounded-full border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-transform relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 left-0 h-full bg-white/20 transition-all pointer-events-none" style={{ height: `${sosProgress}%`, width: '100%', top: `${100 - sosProgress}%` }} />
                    <span className="text-white font-black text-base text-xl">SOS</span>
                  </button>
                  <span className="text-[12px] font-black uppercase">Emergency Only!</span>
                </div>

                <div
                  onClick={() => setCurrentView('calendar')}
                  className="card-sinar flex flex-col items-center justify-between text-center min-h-[160px] py-1 bg-sky-50 !text-slate-800 border-sky-100 cursor-pointer active:scale-95 transition-transform"
                >
                  <h3 className="text-[12px] font-bold uppercase mt-2 tracking-wider text-slate-500">Next Appointment</h3>
                  {appointments.length > 0 ? (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="text-[36px] font-black mt-[-12px]">{getDaysUntilNextAppointment()}</span>
                        <span className="text-[22px] font-bold -mt-3 mb-[-10px]">Days</span>
                      </div>
                      <span className="text-[16px] font-bold text-slate-600 mb-1">{getNextAppointment()?.title || 'Appointment'}</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={43} className="text-slate-300" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddAppointment(true);
                        }}
                        className="text-[12px] font-bold text-sinar-primary mb-3 cursor-pointer">Add one
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* How are you feeling today card */}
              <div className="card-sinar flex flex-col space-y-2 bg-sky-50 mb-0.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                  How are you feeling today?
                </h3>

                <div className="flex gap-3 justify-center">
                  {['Great', 'Okay', 'Not Well'].map((feeling) => (
                    <button
                      key={feeling}
                      onClick={() => {
                        setSelectedFeeling(feeling);
                        setShowFeelingFeedback(true);
                        setTimeout(() => setShowFeelingFeedback(false), 2000);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${selectedFeeling === feeling
                        ? 'bg-sinar-primary text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {feeling}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling Feedback Toast */}
              <AnimatePresence>
                {showFeelingFeedback && selectedFeeling && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-28 left-4 right-4 bg-slate-800 text-white rounded-2xl py-3 px-4 text-center z-[100]"
                  >
                    <p className="text-sm font-bold">
                      {selectedFeeling === 'Great' && '😊 Glad you\'re feeling great! Keep it up!'}
                      {selectedFeeling === 'Okay' && '👍 Thanks for sharing. Anything we can help with?'}
                      {selectedFeeling === 'Not Well' && '💙 Sorry to hear that. Your health companion is here to help!'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Middle Section: Check List */}
              <section className="card-sinar flex-[1.5] min-h-38 max-h-38 flex flex-col bg-white border-2 border-slate-100 shadow-sm overflow-hidden mb-1">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mt-[-5px]">Medication Checklist</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-sinar-secondary px-2 py-0.5 rounded-full text-sinar-primary mt-[-5px]">
                      {meds.filter(m => m.taken).length}/{meds.length} DONE
                    </span>
                    <button
                      onClick={() => setShowAddMed(true)}
                      className="w-5 h-5 bg-sinar-primary text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform mt-[-5px]"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2 pb-2">
                  {meds.map(med => (
                    <button
                      key={med.id}
                      onClick={() => toggleMed(med.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${med.taken
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${med.taken ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                          }`}>
                          {med.taken && <CheckCircle2 size={16} strokeWidth={3} />}
                        </div>
                        <div className="text-left">
                          <p className={`font-black uppercase text-sm tracking-tight ${med.taken ? 'opacity-50 line-through' : ''}`}>
                            {med.name}
                          </p>
                          <p className="text-[10px] font-bold opacity-60 uppercase">{med.dosage} • {med.time}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${med.taken ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {med.taken ? 'Complete' : 'Pending'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Draggable Chatbot Bubble */}
              {!showSOS && (
                <motion.button
                  drag
                  dragConstraints={{ left: 0, right: 287, top: -550, bottom: 0 }}
                  dragMomentum={false}
                  onDragStart={() => setIsDraggingChat(true)}
                  onDragEnd={() => {
                    setTimeout(() => setIsDraggingChat(false), 150);
                  }}
                  onClick={() => {
                    if (!isDraggingChat) setIsChatOpen(true);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-[88px] left-4 w-16 h-16 bg-sinar-primary text-slate-800 rounded-full shadow-lg flex items-center justify-center border-[3px] border-white z-[90] cursor-pointer"
                >
                  <MessageCircle size={20} strokeWidth={2.5} />
                </motion.button>
              )}

              {/* Bottom Section: Progress & Sync */}
              <section className="card-sinar flex-1 min-h-0 flex flex-col items-center bg-sinar-seco ndary/30 border-none shadow-sm">
                <div className="flex items-center justify-center gap-8 w-full">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="65" fill="none" stroke="white" strokeWidth="20" />
                      <circle
                        cx="80" cy="80" r="65" fill="none" stroke="#4ADE80" strokeWidth="20"
                        strokeDasharray="408.4"
                        strokeDashoffset={408.4 * (1 - meds.filter(m => m.taken).length / meds.length)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black">
                        {Math.round((meds.filter(m => m.taken).length / meds.length) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Watch size={16} className="text-sinar-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health Status</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-white">
                      <div className="w-8 h-8 bg-sinar-primary/10 rounded-full flex items-center justify-center text-sinar-primary">
                        <Heart size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black leading-none">{vitals[0]?.value || '--'}</span>
                        <span className="text-[8px] font-black uppercase text-slate-400">bpm</span>
                      </div>
                    </div>
                    <button
                      onClick={syncWatch}
                      disabled={isSyncing}
                      className="mt-1 bg-sinar-primary text-white p-2 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sync</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-slate-100 max-w-md mx-auto z-[80] flex justify-around items-center px-6 text-slate-400">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`flex flex-col items-center gap-1 active:scale-90 transition-transform cursor-pointer ${currentView === 'home' ? 'text-sinar-primary' : ''}`}
                >
                  <Home size={28} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                </button>

                <button
                  onClick={() => setCurrentView('meds')}
                  className={`flex flex-col items-center gap-1 active:scale-90 transition-transform cursor-pointer ${currentView === 'meds' ? 'text-sinar-primary' : ''}`}
                >
                  <Activity size={28} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Meds</span>
                </button>

                <button
                  onClick={() => setCurrentView('vitals')}
                  className={`flex flex-col items-center gap-1 active:scale-90 transition-transform cursor-pointer ${currentView === 'vitals' ? 'text-sinar-primary' : ''}`}
                >
                  <Heart size={28} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Vitals</span>
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className={`flex flex-col items-center gap-1 active:scale-90 transition-transform cursor-pointer ${currentView === 'profile' ? 'text-sinar-primary' : ''}`}
                >
                  <User size={28} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
                </button>
              </footer>

              {/* All Functional Overlays */}
              <AnimatePresence>
                {currentView === 'profile' && (
                  <ProfileView
                    profile={profile}
                    onUpdate={setProfile}
                    onBack={() => setCurrentView('home')}
                  />
                )}
                {currentView === 'meds' && (
                  <div className="absolute inset-0 z-[110] bg-white p-6 overflow-y-auto">
                    <MedicationTracker
                      meds={meds}
                      onToggle={toggleMed}
                      onBack={() => setCurrentView('home')}
                      onAddMed={addMedication}
                      onDeleteMed={deleteMedication}
                      showAddMed={showAddMed}
                      setShowAddMed={setShowAddMed}
                      newMed={newMed}
                      setNewMed={setNewMed}
                    />
                  </div>
                )}
                {currentView === 'vitals' && (
                  <div className="absolute inset-0 z-[110] bg-white p-6 overflow-y-auto overscroll:none">
                    <VitalsLogger
                      onBack={() => setCurrentView('home')}
                      onAdd={addVital}
                    />
                  </div>
                )}
                {currentView === 'calendar' && (
                  <div className="absolute inset-0 z-[110] bg-white p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView('home')} className="p-3 bg-slate-100 rounded-2xl text-sinar-primary">
                          <Home size={32} />
                        </button>
                        <h2 className="text-3xl font-bold tracking-tight uppercase">Calendar</h2>
                      </div>
                      <button
                        onClick={() => { setEditingApptId(null); setNewAppt({ title: '', doctor: '', location: '', date: '', time: '' }); setShowAddAppointment(true); }}
                        className="w-14 h-14 bg-sinar-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                      >
                        <Plus size={32} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-10">
                      {appointments.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest">No events planned</p>
                        </div>
                      ) : (
                        appointments.map(app => (
                          <div key={app.id} className="card-sinar bg-sky-50 !text-slate-800 border-sky-100 flex items-center justify-between p-6">
                            <div className="max-w-[60%]">
                              <p className="font-black text-xl leading-tight mb-1">{app.title}</p>
                              <p className="text-sm font-bold text-slate-500 opacity-80 uppercase tracking-wider">{app.doctor}</p>
                              <p className="text-[10px] text-sinar-primary font-black mt-2 uppercase tracking-widest flex items-center gap-1">
                                <Navigation size={8} /> {app.location}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right bg-white p-3 rounded-2xl border border-sky-100 shadow-sm min-w-[100px]">
                                <p className="font-black text-sm text-sky-900 whitespace-nowrap">
                                  {new Date(app.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <div className="flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                  <Clock size={10} />
                                  <span>{app.time || 'TBA'}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => addToGoogleCalendar(app)}
                                  className="p-2 bg-white rounded-xl text-sinar-primary border border-sky-100 shadow-sm active:scale-90 transition-transform"
                                  title="Add to Google Calendar"
                                >
                                  <CalendarPlus size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditAppt(app)}
                                  className="p-2 bg-white rounded-xl text-sinar-primary border border-sky-100 shadow-sm active:scale-90 transition-transform"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAppt(app.id)}
                                  className="p-2 bg-white rounded-xl text-red-500 border border-red-100 shadow-sm active:scale-90 transition-transform"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <AnimatePresence>
                      {showAddAppointment && (
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 50 }}
                          className="absolute inset-4 bottom-10 top-auto bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-[32px] border border-slate-100 p-6 z-[120] space-y-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                              {editingApptId ? 'Edit Appointment' : 'New Appointment'}
                            </h3>
                            <button onClick={() => setShowAddAppointment(false)} className="text-slate-300"><Plus size={24} className="rotate-45" /></button>
                          </div>
                          <input
                            type="text"
                            placeholder="Appointment Reason (e.g. Blood Test)"
                            value={newAppt.title}
                            onChange={e => setNewAppt({ ...newAppt, title: e.target.value })}
                            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 placeholder:opacity-50 font-bold"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Doctor Name"
                              value={newAppt.doctor}
                              onChange={e => setNewAppt({ ...newAppt, doctor: e.target.value })}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
                            />
                            <input
                              type="date"
                              value={newAppt.date}
                              onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
                            />
                            <input
                              type="time"
                              value={newAppt.time}
                              onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold col-span-2"
                            />
                          </div>
                          <span className="font-bold text-[15px] ml-2 text-red-500 opacity-65"> Please enter a valid date.
                          </span>
                          <button
                            onClick={addAppointment}
                            disabled={isSaveApptDisabled}
                            className={`w-full py-5 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-transform mb-[-10px] ${isSaveApptDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-sinar-primary text-white active:scale-95'}`}
                          > Save Appointment
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>

              {/* Delete Confirmation Modals */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-[32px] p-6 w-full max-w-[300px] shadow-2xl"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <Trash2 size={32} className="text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">Delete Appointment?</h3>
                          <p className="text-slate-500 text-sm mt-1">Are you sure you want to delete this appointment? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button onClick={cancelDeleteAppt} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 active:scale-95 transition-transform">Cancel</button>
                          <button onClick={confirmDeleteAppt} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white active:scale-95 transition-transform">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDeleteChatConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-[32px] p-6 w-full max-w-[300px] shadow-2xl"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                          <MessageCircle size={32} className="text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">Clear Chat History?</h3>
                          <p className="text-slate-500 text-sm mt-1">Are you sure you want to delete all your chat messages? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button onClick={cancelDeleteChatHistory} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 active:scale-95 transition-transform">Cancel</button>
                          <button onClick={confirmDeleteChatHistory} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white active:scale-95 transition-transform">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDeleteMedConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-[32px] p-6 w-full max-w-[300px] shadow-2xl"
                    >
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <Trash2 size={32} className="text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">Delete Medication?</h3>
                          <p className="text-slate-500 text-sm mt-1">Are you sure you want to delete this medication? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button onClick={cancelDeleteMed} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 active:scale-95 transition-transform">Cancel</button>
                          <button onClick={confirmDeleteMed} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white active:scale-95 transition-transform">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Overlay */}
              {isCaregiverMode && selectedPatientId && (
                <div className="absolute top-6 right-6 z-[100]">
                  <button
                    onClick={() => {
                      setSelectedPatientId(null);
                      setCurrentView('caregiver');
                    }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl border-2 border-white"
                  >
                    Exit Patient View
                  </button>
                </div>
              )}

              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.8 }}
                    className="absolute inset-x-4 bottom-10 top-20 bg-white z-[95] rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                  >
                    <div className="p-4 bg-sinar-primary text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <MessageCircle size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold uppercase tracking-widest text-sm">Health Talk</h3>
                          <p className="text-[10px] text-white/70">Very Friendly Sinar</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setShowDeleteChatConfirm(true)} className="p-2 hover:bg-white/10 rounded-xl" title="Clear Chat">
                          <Trash2 size={20} />
                        </button>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                          <Plus size={24} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-white">
                      <HealthCompanion
                        onBack={() => setIsChatOpen(false)}
                        history={chatHistory}
                        onUpdateHistory={setChatHistory}
                        vitals={vitals}
                        meds={meds}
                        compact
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SOS Overlay */}
              <AnimatePresence>
                {showSOS && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-600 z-[200] flex flex-col items-center justify-center p-10 text-white text-center space-y-10"
                  >
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center animate-ping absolute" />
                    <AlertCircle size={100} className="relative z-10" />
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black italic">SOS ALERT!</h2>
                      <p className="text-2xl font-medium">Wait! Help is on the way.</p>
                      <p className="text-lg opacity-80">Caregivers and neighbors have been notified.</p>
                    </div>
                    <button onClick={() => setShowSOS(false)} className="px-10 py-5 bg-white text-red-600 rounded-2xl text-2xl font-bold shadow-xl">Cancel Alert</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Appointment Reminder Overlay */}
              <AnimatePresence>
                {showApptReminder && nextAppt && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="absolute inset-0 bg-black/60 z-[150] flex flex-col justify-end"
                  >
                    <div className="bg-white rounded-t-[40px] p-8 pb-12 space-y-6">
                      <div className="w-16 h-16 bg-sinar-primary/10 rounded-full flex items-center justify-center text-sinar-primary mb-2">
                        <Calendar size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 leading-none mb-2">Appointment Today!</h2>
                        <p className="text-slate-500 font-bold">You have a scheduled visit today.</p>
                      </div>
                      <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reason</p>
                          <p className="text-xl font-black text-slate-800 leading-tight">{nextAppt.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Doctor</p>
                            <p className="text-sm font-bold text-slate-700">{nextAppt.doctor}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p>
                            <p className="text-sm font-bold text-sinar-primary">{nextAppt.time || 'TBA'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</p>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            <Navigation size={12} className="text-sinar-primary" /> {nextAppt.location}
                          </p>
                        </div>
                      </div>
                      <button onClick={dismissApptReminder} className="w-full py-5 bg-sinar-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-transform">Got It!</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showAddMed && currentView === 'home' && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute inset-x-4 bottom-10 top-auto bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.2)] rounded-[32px] border border-slate-100 p-6 z-[160] space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Add Medication</h3>
                      <button onClick={() => setShowAddMed(false)} className="text-slate-300"><Plus size={24} className="rotate-45" /></button>
                    </div>
                    <input
                      type="text"
                      placeholder="Medication Name"
                      value={newMed.name}
                      onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                      className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={newMed.dosage}
                        onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
                      />
                      <input
                        type="time"
                        value={newMed.time}
                        onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold"
                      />
                    </div>
                    <button
                      onClick={addMedication}
                      className="w-full py-5 bg-sinar-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-transform"
                    >
                      Save to Schedule
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}