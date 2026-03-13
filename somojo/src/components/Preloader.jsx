import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORD = "SHOWMOREJOBS";
// Target characters to keep: S(0), O(2), M(4), O(5), J(8), O(9)
// Wait, the phrase is "SHOW MORE JOBS"
// S H O W M O R E J O B S
// 0 1 2 3 4 5 6 7 8 9 10 11
// We need SOMOJO.
// Keep: S(0), O(2), M(4), O(5), J(8), O(9) ?? Wait.
// "SHOW MORE JOBS" = S H O W M O R E J O B S
// Indexes:
// 0: S (Keep - S)
// 1: H
// 2: O (Keep - O)
// 3: W
// 4: M (Keep - M)
// 5: O (Keep - O)
// 6: R
// 7: E
// 8: J (Keep - J)
// 9: O (Keep - O)
// 10: B
// 11: S

const phraseChars = "SHOW MORE JOBS".split("");

export default function Preloader({ onComplete }) {
    const [phase, setPhase] = useState("enter"); // enter -> drop -> slide -> highlight -> exit

    useEffect(() => {
        // 1. Enter text
        const timer1 = setTimeout(() => setPhase("drop"), 1500);
        // 2. Drop unnecessary letters
        const timer2 = setTimeout(() => setPhase("slide"), 2500);
        // 3. Slide remaining letters together
        const timer3 = setTimeout(() => setPhase("highlight"), 3200);
        // 4. Highlight word in green and exit preloader
        const timer4 = setTimeout(() => {
            setPhase("exit");
            setTimeout(() => onComplete(), 1000); // give exit animation time
        }, 4000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [onComplete]);

    // The letters we want to keep to spell SOMOJO
    const keepIndexes = [0, 3, 5, 8, 11, 12];
    // Wait:
    // 0: S (KEEP)
    // 1: H
    // 2: O (KEEP)
    // 3: W
    // 4: ' '
    // 5: M (KEEP)
    // 6: O (KEEP)
    // 7: R
    // 8: E
    // 9: ' '
    // 10: J (KEEP)
    // 11: O (KEEP)
    // 12: B
    // 13: S

    // S(0) O(2) M(5) O(6) J(10) O(11)
    const actualKeepIndexes = [0, 2, 5, 6, 10, 11];

    return (
        <AnimatePresence>
            {phase !== "exit" && (
                <motion.div
                    initial={{ y: 0 }}
                    exit={{ y: "-100vh" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
                >
                    {/* subtle background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-black to-[#050505]"></div>

                    <div className="relative z-10 flex text-4xl md:text-6xl font-black tracking-widest text-[#CF9EFF]">
                        {phraseChars.map((char, i) => {
                            const isSpace = char === " ";
                            const isKept = actualKeepIndexes.includes(i);

                            // Determine current state of letter
                            let opacity = 1;
                            let y = 0;
                            let width = "auto";
                            let color = "#CF9EFF";

                            if (phase === "enter") {
                                // all letters visible (handled by motion.span initial)
                            } else if (phase === "drop") {
                                if (!isKept && !isSpace) {
                                    opacity = 0;
                                    y = 40; // drop down
                                }
                                if (isSpace) { width = 0; opacity = 0; }
                            } else if (phase === "slide" || phase === "highlight") {
                                if (!isKept) {
                                    opacity = 0;
                                    width = 0; // collapse space
                                    y = 40;
                                }
                                if (phase === "highlight" && isKept) {
                                    color = "#5CB144"; // flash green
                                }
                            }

                            return (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity, y, width, color }}
                                    transition={{
                                        opacity: phase === "enter" ? { delay: i * 0.05, duration: 0.5 } : { duration: 0.4 },
                                        y: phase === "enter" ? { delay: i * 0.05, type: "spring" } : { duration: 0.5, type: "spring" },
                                        width: { duration: 0.5, ease: "easeInOut" },
                                        color: { duration: 0.3 }
                                    }}
                                    className={`inline-block ${isSpace ? "w-4 md:w-8" : ""}`}
                                    style={{ display: "inline-block", overflow: "hidden", whiteSpace: "nowrap" }}
                                >
                                    {char}
                                </motion.span>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
