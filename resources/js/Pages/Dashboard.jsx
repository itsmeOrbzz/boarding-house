import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard({ auth, hasProperty, activeProperty, unpaidLeases, expectedRevenue, collectedSoFar }) {

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeaseId, setSelectedLeaseId] = useState("");

    // Find the full lease object based on the dropdown selection
    const selectedLease = unpaidLeases?.find(l => l.id.toString() === selectedLeaseId);

    // Inertia form helper
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        amount_paid: '',
    });

    // Auto-fill the amount when a room is selected
    useEffect(() => {
        if (selectedLease) {
            setData('amount_paid', selectedLease.total_outstanding);
            clearErrors();
        }
    }, [selectedLeaseId]);

    // Close modal and reset all state
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLeaseId("");
        reset();
        clearErrors();
    };

    // Handle the form submission
    const submitPayment = (e) => {
        e.preventDefault();
        post(route('payments.store', selectedLease.id), {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    // Safety check: If she has no properties yet, show a clean empty state
    if (!hasProperty) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card className="text-center p-12">
                            <CardTitle>Welcome to your Dashboard</CardTitle>
                            <p className="text-muted-foreground mt-4">You haven't added any boarding houses yet.</p>
                            <Button className="mt-6">Add Property</Button>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Calculate the total outstanding balance from the unpaid leases array
    const totalOutstanding = unpaidLeases?.reduce((sum, lease) => sum + parseFloat(lease.total_outstanding), 0) || 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {activeProperty.name}
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Link href={route('tenants.create')} className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full border-dashed border-2">
                                    + Add Tenant
                                </Button>
                            </Link>

                            <Link href={route('meters.index')} className="w-full sm:w-auto">
                                <Button variant="secondary" className="w-full">
                                    Input Meter Readings
                                </Button>
                            </Link>

                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                disabled={!unpaidLeases || unpaidLeases.length === 0}
                            >
                                Log Payment
                            </Button>
                        </div>
                    </div>

                    {/* Financial Snapshot Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Expected Revenue</CardTitle>
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ₱{parseFloat(expectedRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">For current month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Collected So Far</CardTitle>
                                <Wallet className="w-4 h-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    ₱{parseFloat(collectedSoFar).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400">Outstanding Balance</CardTitle>
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    ₱{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-500">{unpaidLeases?.length || 0} unpaid {unpaidLeases?.length === 1 ? 'room' : 'rooms'}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Unpaid Bills Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Action Required: Unpaid Bills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!unpaidLeases || unpaidLeases.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">All tenants are fully paid. Great job!</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Room</TableHead>
                                                <TableHead>Tenants</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                                <TableHead className="text-right">Due Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unpaidLeases?.map((lease) => {
                                                return (
                                                    <TableRow key={lease.id}>
                                                        <TableCell className="font-medium whitespace-nowrap">
                                                            {lease.room?.floor ? `${lease.room.floor}F - ` : ''}
                                                            {lease.room?.room_number ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {lease.tenants?.length > 0 ? (
                                                                <div className="flex flex-col gap-1">
                                                                    {lease.tenants.map(t => (
                                                                        <span key={t.id} className="truncate">{t.name}</span>
                                                                    ))}
                                                                </div>
                                                            ) : '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-red-600 dark:text-red-400">
                                                            <div className="flex flex-col items-end">
                                                                <span>₱{parseFloat(lease.total_outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                {lease.bill_count > 1 && (
                                                                    <span className="text-[10px] text-orange-500 font-normal uppercase">{lease.bill_count} Unpaid Bills</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                                                            {lease.due_date
                                                                ? new Date(lease.due_date).toLocaleDateString('en-US', {
                                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                                })
                                                                : '—'
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- LOG PAYMENT MODAL --- */}
                    <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); else setIsModalOpen(true); }}>
                        <DialogContent className="bg-background sm:max-w-[440px]">
                            <form onSubmit={submitPayment}>
                                <DialogHeader>
                                    <DialogTitle>Log Cash Payment</DialogTitle>
                                    <DialogDescription>
                                        Select the room to record a payment for.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-6 py-4">

                                    {/* Step 1: Room Dropdown */}
                                    <div className="grid gap-2">
                                        <Label>Select Room</Label>
                                        <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a room with outstanding balance..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...new Set(unpaidLeases?.map(l => l.room?.floor).filter(Boolean))].map(floor => (
                                                    <SelectGroup key={floor}>
                                                        <SelectLabel>{floor === 3 ? '3rd' : '4th'} Floor</SelectLabel>
                                                        {unpaidLeases?.filter(l => l.room?.floor === floor).map((lease) => {
                                                            return (
                                                                <SelectItem key={lease.id} value={lease.id.toString()}>
                                                                    {lease.room?.room_number} — ₱{parseFloat(lease.total_outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectGroup>
                                                ))}
                                                {/* Fallback for unassigned floor */}
                                                {unpaidLeases?.filter(l => !l.room?.floor).map((lease) => (
                                                    <SelectItem key={lease.id} value={lease.id.toString()}>
                                                        {lease.room?.room_number} — ₱{parseFloat(lease.total_outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Step 2: Room details + payment input (only shown after selecting) */}
                                    {selectedLease && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                                            {/* Room Info Card */}
                                            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">

                                                {/* Room Number */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Room</p>
                                                        <p className="text-lg font-bold text-foreground">{selectedLease.room?.room_number}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Outstanding</p>
                                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                            ₱{parseFloat(selectedLease.total_outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tenant List */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                                                        {selectedLease.tenants?.length === 1 ? 'Tenant' : 'Tenants'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedLease.tenants?.map(tenant => (
                                                            <span key={tenant.id} className="inline-flex items-center rounded-full bg-background border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                                                                {tenant.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Amount Input */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="amount_paid">Amount Received (₱)</Label>
                                                <Input
                                                    id="amount_paid"
                                                    type="number"
                                                    value={data.amount_paid}
                                                    onChange={(e) => setData('amount_paid', e.target.value)}
                                                    step="0.01"
                                                    min="1"
                                                    max={selectedLease.total_outstanding}
                                                    required
                                                    className="text-lg font-bold"
                                                />
                                                {errors.amount_paid && (
                                                    <p className="text-sm font-medium text-destructive">{errors.amount_paid}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!selectedLease || processing}>
                                        {processing ? 'Saving...' : 'Save Payment'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}