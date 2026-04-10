import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Home, UserPlus, Users, Trash2, Camera } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Create({ auth, rooms, propertyName }) {

    // Inertia form state holding both the room data AND an array of tenants
    const { data, setData, post, processing, errors } = useForm({
        room_id: '',
        rent_amount: '',
        water_amount: '',
        internet_amount: '',
        default_kwh_rate: '',
        starting_meter_reading: '',
        next_due_date: new Date().toISOString().split('T')[0],
        tenants: [
            { name: '', phone: '', email: '', id_photo: null } // Start with 1 empty tenant
        ],
    });

    // --- Dynamic Tenant Array Handlers ---
    const addTenant = () => {
        setData('tenants', [
            ...data.tenants,
            { name: '', phone: '', email: '', id_photo: null }
        ]);
    };

    const removeTenant = (indexToRemove) => {
        setData('tenants', data.tenants.filter((_, index) => index !== indexToRemove));
    };

    const updateTenant = (index, field, value) => {
        const newTenants = [...data.tenants];
        newTenants[index][field] = value;
        setData('tenants', newTenants);
    };

    // --- Submit Handler ---
    const submit = (e) => {
        e.preventDefault();
        // forceFormData is crucial here so Laravel accepts the image files correctly!
        post(route('tenants.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Move-In Room" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

                {/* Header Context */}
                <div className="flex items-center mb-6">
                    <Link href={route('dashboard')}>
                        <Button variant="ghost" size="icon" className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Occupy a Room</h2>
                        <p className="text-muted-foreground">{propertyName}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8 pb-24">

                    {/* STEP 1: THE ROOM & FINANCIALS */}
                    <Card className="border-border">
                        <CardHeader className="bg-muted/50 border-b border-border pb-4">
                            <CardTitle className="flex items-center text-lg">
                                <Home className="w-5 h-5 mr-2 text-primary" /> Step 1: Room & Billing Rules
                            </CardTitle>
                            <CardDescription>Assign the vacant room and set the monthly charges.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            <div className="grid gap-2">
                                <Label>Select Vacant Room *</Label>
                                <Select onValueChange={(value) => setData('room_id', value)}>
                                    <SelectTrigger className="w-full sm:max-w-md">
                                        <SelectValue placeholder="Choose a room..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...new Set(rooms.map(r => r.floor))].map(floor => (
                                            <SelectGroup key={floor}>
                                                <SelectLabel>{floor === 3 ? '3rd' : '4th'} Floor</SelectLabel>
                                                {rooms.filter(r => r.floor === floor).map((room) => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        {room.room_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.room_id && <p className="text-xs text-destructive">{errors.room_id}</p>}
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                                <div className="grid gap-2">
                                    <Label>Total Room Rent (₱)</Label>
                                    <Input type="number" step="0.01" value={data.rent_amount} onChange={e => setData('rent_amount', e.target.value)} required />
                                    {errors.rent_amount && <p className="text-xs text-destructive">{errors.rent_amount}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Water Fee (₱)</Label>
                                    <Input type="number" step="0.01" value={data.water_amount} onChange={e => setData('water_amount', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Internet Fee (₱)</Label>
                                    <Input type="number" step="0.01" value={data.internet_amount} onChange={e => setData('internet_amount', e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Electricity Rate (₱ / kWh)</Label>
                                    <Input type="number" step="1" pattern="\d*" placeholder="e.g. 15.00" value={data.default_kwh_rate} onChange={e => setData('default_kwh_rate', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Starting Meter Reading</Label>
                                    <Input type="number" step="1" pattern="\d*" value={data.starting_meter_reading} onChange={e => setData('starting_meter_reading', e.target.value)} required />
                                </div>

                                {/* NATIVE MOBILE-OPTIMIZED BILLING DATE */}
                                <div className="grid gap-2 sm:col-span-2 mt-2 pt-4 border-t border-border/50">
                                    <Label htmlFor="next_due_date">First Billing Date</Label>
                                    <Input
                                        id="next_due_date"
                                        type="date"
                                        value={data.next_due_date}
                                        onChange={e => setData('next_due_date', e.target.value)}
                                        className="w-full sm:max-w-md block dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-125"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Select the date this room's first bill will be generated.</p>
                                    {errors.next_due_date && <p className="text-xs text-destructive">{errors.next_due_date}</p>}
                                </div>
                            </div>

                        </CardContent>
                    </Card>


                    {/* STEP 2: THE TENANTS (DYNAMIC) */}
                    <Card>
                        <CardHeader className="bg-muted/50 border-b border-border pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center text-lg">
                                        <Users className="w-5 h-5 mr-2 text-blue-500" /> Step 2: Register Tenants
                                    </CardTitle>
                                    <CardDescription>Add all individuals occupying this room.</CardDescription>
                                </div>
                                <Button type="button" onClick={addTenant} variant="outline" size="sm" className="hidden sm:flex">
                                    <UserPlus className="w-4 h-4 mr-2" /> Add Another
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 px-4 sm:px-6">

                            {/* Shadcn Accordion for clean stacking */}
                            <Accordion type="multiple" defaultValue={['tenant-0']} className="space-y-4">
                                {data.tenants.map((tenant, index) => (

                                    <AccordionItem key={index} value={`tenant-${index}`} className="border rounded-lg px-4 bg-card shadow-sm">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center font-semibold text-base">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mr-3 text-sm">
                                                    {index + 1}
                                                </div>
                                                {tenant.name || 'New Tenant'}
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pt-2 pb-6 space-y-4">

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2 sm:col-span-2">
                                                    <Label>Full Name *</Label>
                                                    <Input
                                                        value={tenant.name}
                                                        onChange={(e) => updateTenant(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                    {/* Display specific array errors gracefully */}
                                                    {errors[`tenants.${index}.name`] && <p className="text-xs text-destructive">{errors[`tenants.${index}.name`]}</p>}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Phone Number</Label>
                                                    <Input
                                                        value={tenant.phone}
                                                        onChange={(e) => updateTenant(index, 'phone', e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Email Address</Label>
                                                    <Input
                                                        type="email"
                                                        value={tenant.email}
                                                        onChange={(e) => updateTenant(index, 'email', e.target.value)}
                                                    />
                                                </div>

                                                {/* File Upload handling */}
                                                <div className="grid gap-2 sm:col-span-2 p-4 border border-dashed rounded-lg bg-muted/20">
                                                    <Label className="flex items-center text-muted-foreground mb-1">
                                                        <Camera className="w-4 h-4 mr-2" />
                                                        Upload Valid ID (Optional)
                                                    </Label>
                                                    <Input
                                                        type="file"
                                                        accept="image/jpeg, image/png, image/jpg"
                                                        // Note: We don't bind 'value' to file inputs in React
                                                        onChange={(e) => updateTenant(index, 'id_photo', e.target.files[0])}
                                                        className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 hover:file:bg-primary/20"
                                                    />
                                                    {errors[`tenants.${index}.id_photo`] && <p className="text-xs text-destructive">{errors[`tenants.${index}.id_photo`]}</p>}
                                                </div>
                                            </div>

                                            {/* Only allow deletion if there is more than 1 tenant */}
                                            {data.tenants.length > 1 && (
                                                <div className="flex justify-end mt-4 pt-4 border-t border-border border-dashed">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTenant(index)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Remove Tenant
                                                    </Button>
                                                </div>
                                            )}

                                        </AccordionContent>
                                    </AccordionItem>

                                ))}
                            </Accordion>

                            {/* Mobile Add Button */}
                            <Button type="button" onClick={addTenant} variant="outline" className="w-full mt-4 sm:hidden">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Another Tenant
                            </Button>

                        </CardContent>
                    </Card>

                    {/* Submit Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:shadow-none sm:p-0 z-50">
                        <Button type="submit" className="w-full sm:w-auto sm:float-right h-12 text-lg sm:px-8" disabled={processing}>
                            {processing ? 'Saving to Database...' : 'Complete Move-In'}
                        </Button>
                    </div>
                </form>

            </div>
        </AuthenticatedLayout>
    );
}