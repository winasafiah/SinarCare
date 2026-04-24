import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + (100 / 30); // 3 seconds total
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-full bg-slate-100 flex items-center justify-center sm:p-8 overflow-hidden relative">
            {/* Blur Backgrounds */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute -top-[50px] -left-[50px] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[60px]" 
                />
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.25 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="absolute -bottom-[100px] -right-[100px] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[80px]" 
                />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xs">
                {/* Logo */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                    className="relative w-[120px] h-[120px] mb-8 flex items-center justify-center"
                >
                    <img
                        src="/src/Logo.png"
                        alt="SinarCare Logo"
                        className="w-40 h-40 object-contain drop-shadow-xl"
                    />
                </motion.div>

                {/* Logo Text */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex font-black text-[42px] tracking-tight mb-2"
                >
                    <span className="text-slate-800">SINAR</span>
                    <span className="text-sky-400 ml-2">CARE</span>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-[13px] text-slate-500 max-w-[240px] leading-relaxed font-medium mb-10"
                >
                    Assistance for Our Loved Ones
                </motion.p>

                {/* Progress Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden"
                >
                    <motion.div 
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${progress}%` }}
                        layout
                    />
                </motion.div>
                
                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                    {progress < 100 ? 'Loading...' : 'Ready!'}
                </motion.div>
            </div>
        </div>
    );
}
