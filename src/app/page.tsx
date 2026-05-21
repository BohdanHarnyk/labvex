"use client";

import { LandingHeader } from "@/components/layout/LandingHeader";
import { motion } from "framer-motion";
import { Network, Fingerprint, Database, Rocket, ShieldCheck, Cpu, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AbstractBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f8fafc]">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-teal-100/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    
    {/* Geometric Grid Overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
  </div>
);

export default function LandingPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();



  const handleLaunchApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/app");
    } else {
      openAuthModal();
    }
  };

  return (
    <main className="min-h-screen selection:bg-green-100 selection:text-green-900">
      <LandingHeader />
      <AbstractBackground />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LABVEX Mainnet is Live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6"
        >
          Operating System for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Sovereign Science</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 font-medium mb-10 max-w-3xl"
        >
          Не вір паперам. Верифікуй дані. Володій відкриттям.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button 
            onClick={handleLaunchApp}
            className="btn-primary text-lg px-8 py-4 rounded-full shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all hover:-translate-y-1 w-full sm:w-auto cursor-pointer"
          >
            Launch Digital Lab
          </button>
          <a href="#vision" className="text-gray-600 hover:text-gray-900 font-medium px-8 py-4 transition-colors">
            Read Manifesto
          </a>
        </motion.div>
      </section>

      {/* VISION & MANIFESTO */}
      <section id="vision" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Bridge to the Future</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            LABVEX — це універсальна наукова екосистема, що поєднує соціальну взаємодію, AI-координацію та децентралізовану економіку. Ми будуємо «міст» між академічними дослідженнями, приватним капіталом та ентузіастами, перетворюючи науку на прозорий, швидкий та прибутковий процес.
          </p>
        </div>
      </section>

      {/* ARCHITECTURE (4 PILLARS) */}
      <section id="architecture" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Архітектура Платформи (4 Стовпи)</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Фундамент децентралізованої науки наступного покоління.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Fingerprint className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ідентичність та Репутація (Identity Layer)</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong className="text-gray-900">ZK-Passport:</strong> Підтвердження PhD або досвіду через Zero-Knowledge без розкриття персони.</li>
                <li><strong className="text-gray-900">Reputation Score (SBT):</strong> Вага в ком’юніті майниться через огляди та успішні досліди.</li>
                <li><strong className="text-gray-900">Reputation Decay:</strong> Період напіврозпаду (180 днів) змушує залишатися активними.</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Network className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Соціально-Дослідницький Хаб</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong className="text-gray-900">Scientific Feed:</strong> Поєднання Reddit та GitHub для науки. Публікація тредів з ідеями та даними.</li>
                <li><strong className="text-gray-900">Volunteer Onboarding:</strong> Залучення волонтерів. Їхній реальний досвід стає частиною верифікації.</li>
                <li><strong className="text-gray-900">DAO & Forums:</strong> Створення вузькопрофільних DAO для управління напрямками.</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Глобальний Маркетплейс</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong className="text-gray-900">АІ-Агенти:</strong> Оренда спеціалізованого ПЗ для аналізу даних та моделювання.</li>
                <li><strong className="text-gray-900">LaaS:</strong> Оренда лабораторних потужностей по всьому світу через смарт-контракти.</li>
                <li><strong className="text-gray-900">Pitchboard:</strong> Майданчик для прямої комунікації вчених із корпораціями.</li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Економіка Інтелектуальної Власності</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong className="text-gray-900">IPT (IP Tokens):</strong> Токенізація патентів. Ідея ділиться на фракційні частки.</li>
                <li><strong className="text-gray-900">Crowdfunding & Royalties:</strong> Автоматичні виплати роялті інвесторам та волонтерам.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* VEXY AI */}
      <section id="vexy-ai" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle dark abstract background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-gray-900 to-gray-900 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Cpu className="w-4 h-4" /> Шар 2
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Vexy AI: Ваш Консьєрж та Аудитор</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Vexy — це агентний шар 24/7, який безперервно працює всередині мережі LABVEX, забезпечуючи координацію, безпеку та аналітику.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-green-400 block mb-1">Matchmaker</strong>
                  <p className="text-gray-400 text-sm">З’єднує вченого з потрібною лабораторією, інвестором або групою волонтерів.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-green-400 block mb-1">Auditor</strong>
                  <p className="text-gray-400 text-sm">Аналізує наукові дані на предмет маніпуляцій чи аномалій перед верифікацією.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">3</div>
                <div>
                  <strong className="text-green-400 block mb-1">Support</strong>
                  <p className="text-gray-400 text-sm">Допомагає новачкам розібратися в екосистемі та підбирає інструменти.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-3xl font-mono text-sm text-green-400 shadow-2xl">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="mb-2">&gt; Initializing Vexy OS...</p>
            <p className="mb-2">&gt; Analyzing dataset 0x8f2...3a2b</p>
            <p className="mb-2">&gt; Cross-referencing with 14,021 papers...</p>
            <p className="mb-4 text-gray-300">&gt; Warning: Seismic noise detected in raw input. Recommending Fourier transform filter.</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </section>

      {/* GOVERNANCE & SAFETY */}
      <section id="governance" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Управління та Безпека</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Баланс голосу (Anti-Whale)</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Ми використовуємо квадратичне голосування та коефіцієнт репутації. Гроші не дають права абсолютного контролю. Вага голосу розраховується за формулою:
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-center text-gray-800 font-bold mb-4">
                Вплив = √(Токени) * Коефіцієнт Репутації
              </div>
              <p className="text-gray-600 text-sm">
                Це запобігає захопленню влади «китами» без наукового досвіду.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Комплаєнс та Фільтрація</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><strong className="text-gray-900">CAS Screening:</strong> Автоматична перевірка речовин за базами ВООЗ, FDA та UNODC. Блокування заборонених прекурсорів.</li>
                <li><strong className="text-gray-900">Geo-fencing:</strong> Обмеження доступу згідно з локальним законодавством користувача.</li>
                <li><strong className="text-gray-900">Ethical Council:</strong> HITL-панель (Human-in-the-loop) для перевірки «сірих зон» та нових сполук.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & DISCLAIMERS */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Medical Disclaimer</h4>
            <ul className="text-xs text-gray-500 space-y-2">
              <li>Інформація на платформі надається виключно в дослідницьких цілях.</li>
              <li>LABVEX не надає медичних порад чи планів лікування.</li>
              <li>Участь у волонтерських програмах є добровільною, а ризики покладаються на учасника.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Terms of Condition</h4>
            <ul className="text-xs text-gray-500 space-y-2">
              <li><strong className="text-gray-700">Middleware Status:</strong> LABVEX — це лише інфраструктура; відповідальність несуть ініціатори.</li>
              <li><strong className="text-gray-700">IP Risks:</strong> Інвестиції в IPT є венчурними; платформа не гарантує успіх патентування.</li>
              <li><strong className="text-gray-700">Data Sovereignty:</strong> Користувач володіє своїми даними, але погоджується на їх анонімне використання ШІ для аудиту.</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="font-bold text-gray-900 tracking-tight">LABVEX 2026</span>
          </div>
          <p className="text-sm text-gray-500">© LABVEX Protocol. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
