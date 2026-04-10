import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Glowing Orbs for the dark mode aesthetic */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />

            <Head title="Log in | Rose Boarding House" />

            {/* Glassmorphic Container */}
            <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl p-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-white/20 transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                    <p className="text-zinc-400 mt-2 text-sm tracking-wide">Enter your credentials to manage your properties.</p>
                </div>

                {status && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-400 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold tracking-wide text-zinc-300 mb-2">Admin Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-black/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold tracking-wide text-zinc-300 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-black/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                        {errors.password && <p className="mt-2 text-sm text-red-500 font-medium">{errors.password}</p>}
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group w-max">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-zinc-700 rounded-md bg-zinc-900 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#09090b] transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium tracking-wide text-zinc-400 group-hover:text-zinc-200 transition-colors">Keep me signed in</span>
                        </label>
                    </div>

                    <button
                        disabled={processing}
                        type="submit"
                        className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {processing ? 'Authenticating System...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
