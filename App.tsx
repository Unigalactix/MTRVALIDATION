import React, { useState, useCallback, useRef, useEffect } from 'react';
import { run } from './services/geminiService';
import type { FilePart } from './services/geminiService';
import type { Message } from './types';
import { MessageAuthor } from './types';

// -- SVG Icons -- //

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
);
const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-9.94 9h2.02A8 8 0 0 1 12 4a8.1 8.1 0 0 1 8 8 8 8 0 0 1-8 8v2.06A10 10 0 0 0 22 12a10 10 0 0 0-10-10z" /></svg>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
);
const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm-2.5.5h1v-2h-1v2zm6.5 2h-1.5V7H15v3h1.5v1.5h-1.5V13H17v1.5h-1.5V16h-1.5v-2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>
);


// --- MTR-specific Icons ---
const DocumentChaosIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="13" y2="17"></line><line x1="10" y1="9" x2="10" y2="9"></line></svg>
);
const HourglassIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v6c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V2 M6 22v-6c0-1.1.9-2 2-2h8a2 2 0 0 0 2 2v6 M12 10v4"></path></svg>
);
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const FileStackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 17H8 M16 13H8 M10 9H8"></path></svg>
);
const ScanIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2 M7 12h10"></path></svg>
);
const ExtractIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"></path><path d="M15 2v20 M9 7h1 M9 12h3 M9 17h5"></path></svg>
);
const CompareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path><polyline points="15 1 22 1 22 8"></polyline><polyline points="9 23 2 23 2 16"></polyline></svg>
);
const FlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7"></path></svg>
);
const ReportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>
);


// -- Animation Hook -- //
const useIntersectionObserver = (options: IntersectionObserverInit): [React.RefObject<HTMLDivElement>, boolean] => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isVisible];
};


// -- UI Components -- //
interface InfoCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    animationDelay?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, animationDelay = 0 }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div ref={ref}
            className={`bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 flex flex-col gap-4 transform transition-all duration-700 hover:scale-105 hover:bg-slate-800 hover:border-cyan-400/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${animationDelay}ms` }}
        >
            <div className="flex items-center gap-4">
                <div className="text-cyan-400 w-10 h-10 flex-shrink-0">{icon}</div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

const AnimatedHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });
    return (
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">{subtitle}</p>
        </div>
    );
};

const AnimatedPayoff: React.FC = () => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

    return (
        <div ref={ref} className={`max-w-4xl mx-auto space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-red-500/50">
                    <h3 className="font-bold text-lg text-red-400">Manual Process</h3>
                    <ul className="text-slate-300 mt-2 space-y-1 text-sm">
                        <li>- Hours or days to process</li>
                        <li>- Prone to human error</li>
                        <li>- Difficult to track & audit</li>
                        <li>- High labor and risk costs</li>
                    </ul>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-teal-500/50">
                    <h3 className="font-bold text-lg text-teal-400">AI-Automated Process</h3>
                    <ul className="text-slate-300 mt-2 space-y-1 text-sm">
                        <li>+ Reduces time to minutes</li>
                        <li>+ Minimizes errors, ensures accuracy</li>
                        <li>+ Fully traceable & audit-ready</li>
                        <li>+ Significant cost savings</li>
                    </ul>
                </div>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-xl text-white text-center shadow-lg">
                <h4 className="font-bold text-xl">Real-World Results</h4>
                <p className="mt-2">MTR processing time reduced by <span className="font-extrabold text-2xl">99%</span> (from 3 days to 15 minutes), generating <span className="font-extrabold text-2xl">$40,000</span> in additional annual revenue.</p>
            </div>
        </div>
    );
};


const MTRInfographicSection: React.FC = () => {
    const manualChallenges = [
        { title: "Inconsistent & Messy Formats", description: "MTRs lack standardization, forcing teams to hunt for data on every document, slowing down validation.", icon: <DocumentChaosIcon className="w-full h-full" /> },
        { title: "Time-Consuming Extraction", description: "Engineers perform line-by-line reviews to manually pull critical data from dense PDFs and scanned documents.", icon: <HourglassIcon className="w-full h-full" /> },
        { title: "High Potential for Human Error", description: "Manual data entry is prone to mistakes, which can lead to using non-compliant materials and project delays.", icon: <ErrorIcon className="w-full h-full" /> },
        { title: "Overwhelming Document Volume", description: "Managing dozens or hundreds of MTRs per project creates backlogs that directly impact production schedules.", icon: <FileStackIcon className="w-full h-full" /> },
    ];
    const automatedWorkflow = [
        { title: "Document Digitization (OCR)", description: "AI ingests any MTR format, using Optical Character Recognition to extract all text, even from complex tables.", icon: <ScanIcon className="w-full h-full" /> },
        { title: "Automated Data Extraction (ML)", description: "Machine Learning models intelligently identify and extract data like heat numbers, chemical compositions, and properties.", icon: <ExtractIcon className="w-full h-full" /> },
        { title: "Rule-Based Comparison", description: "The system automatically compares extracted data against project specifications and industry standards (ASTM, ASME, ISO).", icon: <CompareIcon className="w-full h-full" /> },
        { title: "Anomaly Detection", description: "The AI flags any discrepancies, deviations, or unusual test results that might be missed during a manual review.", icon: <FlagIcon className="w-full h-full" /> },
        { title: "Report Generation", description: "A comprehensive, standardized validation report is automatically generated, creating a fully traceable, audit-ready trail.", icon: <ReportIcon className="w-full h-full" /> },
    ];

    return (
        <section className="py-12 sm:py-16 space-y-20 overflow-x-hidden">
            <div>
                <AnimatedHeader title='The "Before": A World of Manual MTR Processing' subtitle='The traditional process is a significant time sink, plagued by challenges that drain productivity and increase risk.' />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {manualChallenges.map((app, i) => (
                        <InfoCard key={i} title={app.title} description={app.description} icon={app.icon} animationDelay={i * 100} />
                    ))}
                </div>
            </div>
            <div>
                <AnimatedHeader title='The "After": The Automated AI Workflow' subtitle='AI agents—specialized digital workers—handle documents with unprecedented speed and accuracy.' />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {automatedWorkflow.map((step, i) => (
                        <InfoCard key={i} title={step.title} description={step.description} icon={step.icon} animationDelay={i * 100} />
                    ))}
                </div>
            </div>
            <div>
                <AnimatedHeader title='The Payoff: A Game-Changer for Quality Assurance' subtitle='Automating MTRs transforms document management from a burden into a strategic advantage.' />
                <AnimatedPayoff />
            </div>
        </section>
    );
};


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.author === MessageAuthor.USER;
    const authorDetails = {
        [MessageAuthor.USER]: { name: "You", Icon: UserIcon, align: "items-end", bg: "bg-gradient-to-r from-purple-600 to-indigo-600", text: "text-white" },
        [MessageAuthor.GEMINI]: { name: "Gemini", Icon: GeminiIcon, align: "items-start", bg: "bg-slate-700/80", text: "text-slate-100" },
        [MessageAuthor.TOOL]: { name: "Tool", Icon: GeminiIcon, align: "items-start", bg: "bg-cyan-900/50 border border-cyan-700", text: "text-slate-100" },
    };
    const { name, Icon, align, bg, text } = authorDetails[message.author];

    return (
        <div className={`flex flex-col gap-2 w-full ${align}`}>
            <div className="flex items-center gap-2">
                {!isUser && <Icon className="w-6 h-6 text-teal-400" />}
                <span className="font-semibold text-sm text-slate-400">{name}</span>
                {isUser && <Icon className="w-6 h-6 text-purple-400" />}
            </div>
            <div className={`max-w-xl rounded-2xl p-4 ${bg} ${text} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                 {typeof message.content === 'string' ? (
                     <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
                ) : (
                    <div className="prose prose-sm prose-invert max-w-none">{message.content}</div>
                )}
            </div>
        </div>
    );
};

const fileToGenerativePart = async (file: File): Promise<FilePart> => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise as string,
            mimeType: file.type
        }
    };
};

const DemoSection: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', author: MessageAuthor.GEMINI, content: "Welcome! You can upload a PDF of a Mill Test Report for analysis, or just paste in the text. You can also ask general questions like 'What is a heat number?'" }
    ]);
    const [input, setInput] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPdfFile(file);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || (!input.trim() && !pdfFile)) return;

        setIsLoading(true);
        
        const userMessageContent = (
            <div className="flex flex-col gap-2">
                {pdfFile && (
                    <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg">
                        <PdfIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                        <span className="truncate text-sm">{pdfFile.name}</span>
                    </div>
                )}
                {input && <p>{input}</p>}
            </div>
        );
        
        const userMessage: Message = { id: Date.now().toString(), author: MessageAuthor.USER, content: userMessageContent };
        setMessages(prev => [...prev, userMessage]);
        
        const currentInput = input;
        const currentPdfFile = pdfFile;

        setInput('');
        setPdfFile(null);
        
        let result;
        try {
            if (currentPdfFile) {
                const filePart = await fileToGenerativePart(currentPdfFile);
                result = await run(currentInput, filePart);
            } else {
                result = await run(currentInput);
            }
    
            if ('error' in result) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    author: MessageAuthor.GEMINI,
                    content: `Sorry, I ran into an error: ${result.error}`
                };
                setMessages(prev => [...prev, errorMessage]);
            } else {
                const geminiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    author: MessageAuthor.GEMINI,
                    content: result.response
                };
                setMessages(prev => [...prev, geminiMessage]);
            }
        } catch (error) {
             const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                author: MessageAuthor.GEMINI,
                content: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        setIsLoading(false);

    }, [input, isLoading, pdfFile]);

    return (
        <section className="py-12 sm:py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Interactive Demo: AI MTR Data Extractor</h2>
                <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">Upload a PDF or paste text to see how AI can instantly parse MTR data.</p>
            </div>
            <div className="max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col h-[600px]">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2">
                                <GeminiIcon className="w-6 h-6 text-teal-400" />
                                <div className="bg-slate-700 rounded-2xl p-4 text-slate-100 rounded-bl-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                 <div className="p-4 border-t border-slate-700/50">
                    {pdfFile && (
                        <div className="relative flex items-center gap-2 bg-slate-800 p-2 rounded-lg mb-2">
                            <PdfIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-slate-300 truncate flex-1">{pdfFile.name}</span>
                            <button onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-slate-400 hover:text-white transition-colors">
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-cyan-400 p-3 rounded-full transition-colors duration-300 flex-shrink-0" disabled={isLoading}>
                             <PaperclipIcon className="w-6 h-6" />
                         </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={pdfFile ? "Add a comment about the PDF..." : "e.g., Heat Number: 12345..."}
                            className="w-full bg-slate-800 text-white rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors duration-300 flex-shrink-0" disabled={isLoading || (!input.trim() && !pdfFile)}>
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

const Header: React.FC = () => (
    <header className="py-12 text-center bg-gradient-to-b from-slate-900 to-transparent">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-purple-500 tracking-tight">
            From Chaos to Clarity: AI-Powered MTR Validation
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            Transforming the messy, manual process of Mill Test Report validation into a streamlined, automated, and accurate system.
        </p>
    </header>
);

const ReferenceSection: React.FC = () => (
    <footer className="text-center py-8 border-t border-slate-800">
        <p className="text-slate-400 text-sm">
            Content based on <a href="https://docs.google.com/document/d/e/2PACX-1vQ-tPu6YTQzouBs3EQwVxlNQc6XmzHiZvFhnjq84wfmOjp4HIdrFGNp7jL6mFpt8l9DOcOtnBrCJuwr/pub" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">"A Practical Guide to Implementing AI for MTR Validation"</a> by Rajesh Kodaganti.
        </p>
    </footer>
);

const App: React.FC = () => {
    return (
        <div className="min-h-screen text-slate-100 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 selection:bg-cyan-500/30">
            <main className="container mx-auto px-4">
                <Header />
                <MTRInfographicSection />
                <DemoSection />
                <ReferenceSection />
            </main>
        </div>
    );
};

export default App;
