
'use server'
import { z } from 'zod'
import { Invoice } from './definitions'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

//Marcamos que todas las funciones que se exportan en este archivo son de servidores
// y por lo tanto no se ejecutan ni se envian al cliente

const CreateInvoiceSchema = z.object({

    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
    id: true,
    date: true
})

export async function createInvoice(formData: FormData) {

    const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    // transformamos para evitar errores de rendondeo
    const amountIncents= amount*100

    // Creamos la fecha actual
    const [date]= new Date().toISOString().split('T')

    console.log({ customerId, amountIncents, status,date });
    await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId},${amountIncents},${status},${date} )`

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}