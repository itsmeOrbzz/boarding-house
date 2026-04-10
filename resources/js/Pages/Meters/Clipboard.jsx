import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Zap, AlertTriangle, CheckCircle2, Receipt, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

export default function MeterReadings({ auth, propertyName, rooms }) {

    const [readings, setReadings] = useState({});
    const [rates, setRates] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleReadingChange = (roomId, value) => {
        setReadings(prev => ({ ...prev, [roomId]: value }));
    };

    const calculateBill = (room) => {
        const previousReading = parseInt(room.current_meter_reading, 10) || 0;
        const currentReading = parseInt(readings[room.id], 10) || 0;

        const rate = rates[room.id] !== undefined
            ? Number(rates[room.id])
            : Number(room.lease?.default_kwh_rate) || 0;

        const rent = Number(room.lease?.rent_amount) || 0;
        const water = Number(room.lease?.water_amount) || 0;
        const internet = Number(room.lease?.internet_amount) || 0;

        let kwhUsed = 0;
        let elecCost = 0;
        let status = 'neutral';
        let message = '';

        if (readings[room.id]) {
            kwhUsed = currentReading - previousReading;

            if (kwhUsed < 0) {
                status = 'error';
                message = 'New reading is lower than previous.';
                kwhUsed = 0;
            } else if (kwhUsed > 300) {
                status = 'warning';
                message = 'Unusually high usage detected.';
                elecCost = kwhUsed * rate;
            } else {
                status = 'success';
                elecCost = kwhUsed * rate;
            }
        }

        const totalBill = rent + water + internet + elecCost;

        return { kwhUsed, elecCost, totalBill, status, message, rent, water, internet, rate };
    };

    const submit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Build the payload with field names matching MeterController's validation rules
        const payload = rooms.map(room => ({
            lease_id: room.lease.id,
            prev_reading: room.current_meter_reading,
            curr_reading: readings[room.id] || room.current_meter_reading,
            default_rate: rates[room.id] !== undefined
                ? Number(rates[room.id])
                : (Number(room.lease?.default_kwh_rate) || 0),
        }));

        router.post(route('meters.store'), { readings: payload }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Invoices Generated Successfully!", {
                    description: "All tenants have been billed for this cycle."
                });
                setReadings({});
            },
            onError: () => {
                toast.error("Uh oh! Something went wrong.", {
                    description: "Please check the highlighted fields and try again."
                });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Generate Bills" />

            <div className="max-w-5xl mx-auto py-6 px-4 sm:py-8 sm:px-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center">
                        <Link href={route('dashboard')}>
                            <Button variant="ghost" size="icon" className="mr-3 sm:mr-4">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Generate Bills</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">{propertyName}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6 pb-24">

                    {[...new Set(rooms.map(r => r.floor))].map(floor => (
                        <div key={`floor-${floor}`} className="space-y-6">
                            <h3 className="text-xl font-bold tracking-tight mt-8 pt-4 border-t flex items-center">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md">{floor === 3 ? '3rd' : '4th'} Floor</span>
                            </h3>
                            
                            {rooms.filter(r => r.floor === floor).map((room) => {
                                const calc = calculateBill(room);
                                const tenantNames = room.tenants?.map(t => t.name).join(', ') || 'No registered tenants';

                                return (
                                    <Card key={room.id} className={cn(
                                        "border-l-4 transition-all duration-200 overflow-hidden",
                                        calc.status === 'error' ? "border-l-destructive shadow-sm" :
                                            calc.status === 'warning' ? "border-l-yellow-500 shadow-sm" :
                                                calc.status === 'success' ? "border-l-green-500 shadow-md border-border" : "border-l-muted border-border"
                                    )}>
                                        {/* MOBILE-OPTIMIZED HEADER */}
                                        <CardHeader className="p-4 sm:p-6 sm:pb-4 bg-muted/30 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl">{room.room_number}</CardTitle>
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">Occupied by: {tenantNames}</p>
                                            </div>

                                            {/* Responsive Rate Input */}
                                            <div className="flex items-center w-full sm:w-auto bg-background border rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-ring transition-shadow">
                                                <Zap className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                                                <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap m-0 mr-2">Rate: ₱</Label>
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    pattern="\d*"
                                                    className="w-full sm:w-16 h-7 text-right text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 font-semibold bg-transparent"
                                                    value={rates[room.id] !== undefined ? rates[room.id] : (room.lease?.default_kwh_rate || '')}
                                                    onChange={(e) => setRates(prev => ({ ...prev, [room.id]: e.target.value }))}
                                                />
                                                <span className="text-xs sm:text-sm text-muted-foreground ml-1">/kWh</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-4 sm:p-6">
                                            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">

                                                {/* LEFT SIDE: Inputs */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            <Label className="text-xs sm:text-sm text-muted-foreground">Previous Reading</Label>
                                                            <div className="p-2 sm:p-3 bg-muted/50 rounded-md border font-mono text-base sm:text-lg text-center flex items-center justify-center h-10 sm:h-12">
                                                                {room.current_meter_reading}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            <Label className={cn("text-xs sm:text-sm", calc.status === 'error' && "text-destructive font-bold")}>
                                                                New Reading *
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                step="1"
                                                                pattern="\d*"
                                                                className={cn(
                                                                    "font-mono text-base sm:text-lg text-center h-10 sm:h-12",
                                                                    calc.status === 'error' && "border-destructive focus-visible:ring-destructive"
                                                                )}
                                                                placeholder="0"
                                                                value={readings[room.id] || ''}
                                                                onChange={(e) => handleReadingChange(room.id, e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Status Messages */}
                                                    <div className="h-5">
                                                        {calc.status === 'error' && (
                                                            <p className="text-xs sm:text-sm text-destructive flex items-center animate-in fade-in">
                                                                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" /> {calc.message}
                                                            </p>
                                                        )}
                                                        {calc.status === 'warning' && (
                                                            <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-500 flex items-center animate-in fade-in">
                                                                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" /> {calc.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* RIGHT SIDE: Live Bill Preview */}
                                                <div className="bg-card border rounded-lg p-4 sm:p-5 shadow-sm flex flex-col justify-center">
                                                    <div className="space-y-2.5 mb-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Base Rent:</span>
                                                            <span>₱{calc.rent.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Water & Internet:</span>
                                                            <span>₱{(calc.water + calc.internet).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm items-center">
                                                            <span className="text-muted-foreground flex items-center">
                                                                <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                                                                Electricity ({calc.kwhUsed} kWh):
                                                            </span>
                                                            <span className={calc.kwhUsed > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
                                                                ₱{calc.elecCost.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-3.5 border-t flex justify-between items-end">
                                                        <span className="font-medium sm:font-semibold text-base sm:text-lg">Total Bill:</span>
                                                        <span className="font-bold text-xl sm:text-2xl text-primary leading-none">
                                                            ₱{calc.totalBill.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ))}

                    {/* Submit Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:shadow-none sm:p-0 z-50 flex justify-end">
                        <Button type="submit" size="lg" className="w-full sm:w-auto h-12 px-8 text-base sm:text-lg shadow-md" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Invoices...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-5 h-5 mr-2" />
                                    Save & Generate Invoices
                                </>
                            )}
                        </Button>
                    </div>
                </form>

            </div>
        </AuthenticatedLayout>
    );
}